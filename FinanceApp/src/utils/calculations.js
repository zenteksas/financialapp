/**
 * Utility for financial calculations ported from the original DebtCalculator.
 */
export class DebtMath {
  /**
   * Converts Effective Annual Rate (EA) to Effective Monthly Rate (EM).
   */
  static eaToEm(ea) {
    const rate = ea >= 1.0 ? ea / 100.0 : ea;
    return Math.pow(1 + rate, 1.0 / 12.0) - 1;
  }

  /**
   * Projects a single debt payoff based on current parameters.
   */
  static projectDebt(montoInicial, ea, cuotaMinima, cuotaManejo = 0, seguros = 0, abonoAdicional = 0) {
    const em = this.eaToEm(ea);
    let monto = montoInicial;
    let meses = 0;
    let interesesTotales = 0;
    let otrosGastosTotales = 0;
    const pagoMensual = cuotaMinima + abonoAdicional;

    if (pagoMensual <= 0) return { es_pagable: false };

    // Prevenir infinite loop hard limit (100 years)
    while (monto > 0 && meses < 1200) {
      const interesMes = monto * em;
      const gastosFijosMes = cuotaManejo + seguros;

      if (pagoMensual <= (interesMes + gastosFijosMes)) {
        return { es_pagable: false };
      }

      const abonoCapital = pagoMensual - interesMes - gastosFijosMes;

      if (monto <= abonoCapital) {
        // Último mes
        interesesTotales += interesMes;
        otrosGastosTotales += gastosFijosMes;
        meses += 1;
        monto = 0;
      } else {
        interesesTotales += interesMes;
        otrosGastosTotales += gastosFijosMes;
        monto -= abonoCapital;
        meses += 1;
      }
    }

    if (meses >= 1200) return { es_pagable: false };

    const totalPagado = montoInicial + interesesTotales + otrosGastosTotales;

    return {
      es_pagable: true,
      meses: meses,
      intereses_totales: interesesTotales,
      otros_gastos_totales: otrosGastosTotales,
      total_pagado_final: totalPagado
    };
  }

  /**
   * Analyzes multiple debts using a specific strategy (snowball, avalanche, cashflow).
   */
  static analyzePayoff(debtsRaw, extraMonthly, strategy = "snowball", scheduledPayments = {}) {
    let debts = debtsRaw.map(d => ({
      ...d,
      monto_original: d.monto,
      activa: true
    }));

    // Initial projection validation
    const excluded = [];
    debts = debts.filter(d => {
      const res = this.projectDebt(d.monto, d.ea, d.cuotaMinima, d.cuotaManejo || 0, d.seguros || 0, 0);
      if (!res.es_pagable) {
        excluded.push({
          ...d,
          reason: 'La cuota mínima no cubre los intereses y gastos fijos.'
        });
      }
      return res.es_pagable;
    });

    // Sorting based on strategy
    if (strategy === "avalanche") {
      debts.sort((a, b) => b.ea - a.ea); // Higher interest first
    } else if (strategy === "cashflow") {
      debts.sort((a, b) => (a.monto / a.cuotaMinima) - (b.monto / b.cuotaMinima)); // Lower cashflow index first
    } else {
      debts.sort((a, b) => a.monto - b.monto); // Lower balance first (Snowball)
    }

    let mesGlobal = 0;
    let fluxExtra = parseFloat(extraMonthly) || 0;
    const history = [];
    let totalPaid = 0;
    let totalInterest = 0;

    while (debts.some(d => d.activa) && mesGlobal < 1200) {
      mesGlobal += 1;
      let releasedQuotas = 0;

      // 1. Min payments to all active debts
      for (const d of debts) {
        if (!d.activa) continue;

        const em = this.eaToEm(d.ea);
        const interesMes = d.monto * em;
        const gastos = (d.cuotaManejo || 0) + (d.seguros || 0);
        let pagoBase = d.cuotaMinima;

        // If debt is almost paid
        if (d.monto + interesMes + gastos < pagoBase) {
          pagoBase = d.monto + interesMes + gastos;
        }

        const abonoCap = pagoBase - interesMes - gastos;
        
        totalInterest += interesMes + gastos;
        totalPaid += pagoBase;

        if (abonoCap > 0) d.monto -= abonoCap;

        if (d.monto <= 0) {
          d.monto = 0;
          d.activa = false;
          releasedQuotas += d.cuotaMinima;
          history.push({ 
            type: 'success', 
            text: `Mes ${mesGlobal}: ¡Deuda '${d.nombre}' saldada! Liberas $${d.cuotaMinima.toLocaleString()}/mes`
          });
        }
      }

      // 2. Extra payments
      let currentExtra = fluxExtra;
      if (scheduledPayments[mesGlobal]) {
        currentExtra += scheduledPayments[mesGlobal];
        history.push({ 
          type: 'info', 
          text: `Mes ${mesGlobal}: Abono extra de $${scheduledPayments[mesGlobal].toLocaleString()} inyectado!`
        });
      }

      // 3. Apply extra to priority target
      if (currentExtra > 0) {
        const target = debts.find(d => d.activa);
        if (target) {
          const apply = Math.min(target.monto, currentExtra);
          target.monto -= apply;
          totalPaid += apply;

          if (target.monto <= 0) {
            target.monto = 0;
            target.activa = false;
            releasedQuotas += target.cuotaMinima;
            history.push({ 
              type: 'warning', 
              text: `Mes ${mesGlobal}: '${target.nombre}' liquidada por abonos extra!`
            });
          }
        }
      }

      // 4. Cascade quotas to next target
      fluxExtra += releasedQuotas;
    }

    return {
      totalMonths: mesGlobal,
      history: history,
      excluded: excluded,
      totalPaid: totalPaid,
      totalInterest: totalInterest
    };
  }

  /**
   * Returns current status quo (paying only minimums, no cascading).
   */
  static getStatusQuo(debtsRaw) {
    let totalInterest = 0;
    let worstMonth = 0;
    let totalPaid = 0;
    const initialBalance = debtsRaw.reduce((sum, d) => sum + (parseFloat(d.monto) || 0), 0);

    for (const d of debtsRaw) {
      const res = this.projectDebt(d.monto, d.ea, d.cuotaMinima, d.cuotaManejo || 0, d.seguros || 0, 0);
      if (res.es_pagable) {
        totalInterest += res.intereses_totales + res.otros_gastos_totales;
        if (res.meses > worstMonth) worstMonth = res.meses;
      }
    }
    return { totalMonths: worstMonth, totalInterest, totalPaid: initialBalance + totalInterest };
  }

  /**
   * Simulates a debt consolidation (buying portfolio) vs current status quo.
   */
  static simulateConsolidation(debtsRaw, nuevaEa, nuevoManejo, nuevosSeguros, plazoMeses) {
    if (!debtsRaw || debtsRaw.length === 0) return { valido: false, error: "No hay deudas" };

    let totalMontoActual = 0;
    let totalCuotaActual = 0;
    let totalInteresActual = 0;
    let peorMes = 0;

    for (const d of debtsRaw) {
      const res = this.projectDebt(d.monto, d.ea, d.cuotaMinima, d.cuotaManejo || 0, d.seguros || 0, 0);
      if (!res.es_pagable) return { valido: false, error: `La deuda ${d.nombre} no es pagable con su cuota actual.` };

      totalMontoActual += d.monto;
      totalCuotaActual += d.cuotaMinima;
      totalInteresActual += res.intereses_totales + res.otros_gastos_totales;
      if (res.meses > peorMes) peorMes = res.meses;
    }

    // Nueva Oferta
    const em = this.eaToEm(nuevaEa);
    let cuotaPura = 0;
    if (em === 0) {
      cuotaPura = totalMontoActual / plazoMeses;
    } else {
      cuotaPura = (totalMontoActual * em) / (1 - Math.pow(1 + em, -plazoMeses));
    }

    const nuevaCuotaTotal = cuotaPura + nuevoManejo + nuevosSeguros;
    const resNuevo = this.projectDebt(totalMontoActual, nuevaEa, nuevaCuotaTotal, nuevoManejo, nuevosSeguros, 0);

    if (!resNuevo.es_pagable) return { valido: false, error: "El nuevo crédito planteado no se puede pagar." };

    const interesNuevoTotal = resNuevo.intereses_totales + resNuevo.otros_gastos_totales;
    const ahorroMensual = totalCuotaActual - nuevaCuotaTotal;
    const ahorroTotal = totalInteresActual - interesNuevoTotal;

    let veredicto = "";
    if (ahorroTotal > 0 && ahorroMensual > 0) {
      veredicto = "✅ ¡ACEPTA! Ganarás liquidez mensual y ahorrarás dinero en intereses a largo plazo.";
    } else if (ahorroTotal > 0 && ahorroMensual <= 0) {
      veredicto = "⚠️ Ahorras dinero en intereses a largo plazo, PERO perderás liquidez mes a mes (tu cuota sube).";
    } else if (ahorroTotal <= 0 && ahorroMensual > 0) {
      veredicto = "⚠️ Es una trampa de liquidez: Tendrás dinero extra este mes, pero terminarás pagando mucho más al final.";
    } else {
      veredicto = "❌ ¡RECHAZA! Es un pésimo negocio. Pierdes dinero mensual y pagarás más intereses.";
    }

    return {
      valido: true,
      statu_quo: { cuota_mensual: totalCuotaActual, intereses_y_gastos: totalInteresActual },
      nueva_oferta: { cuota_mensual: nuevaCuotaTotal, intereses_y_gastos: interesNuevoTotal },
      analisis: { ahorro_mensual: ahorroMensual, ahorro_total_dinero: ahorroTotal, veredicto: veredicto }
    };
  }
}
