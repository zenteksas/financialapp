const FINANCIAL_TIPS = [
  "Regla 50-30-20: Destina el 50% a necesidades, 30% a deseos y 20% a ahorros o pago de deudas.",
  "Fondo de Emergencia: Intenta ahorrar al menos 3 meses de tus gastos básicos para imprevistos.",
  "Págate a ti primero: Automatiza una transferencia a tus ahorros apenas recibas tu salario.",
  "Evita los gastos hormiga: Esos pequeños cafés o snacks diarios pueden sumar una fortuna al mes.",
  "Estrategia de Deuda: La 'Bola de Nieve' ayuda psicológicamente al pagar primero las deudas pequeñas.",
  "Estrategia de Deuda: La 'Avalancha' te ahorra más dinero al pagar primero lo que tiene mayor interés.",
  "Inversión Temprana: El interés compuesto es tu mejor amigo; empieza a invertir lo antes posible.",
  "Regla de las 24 Horas: Si quieres algo que no necesitas, espera un día antes de comprarlo para evitar impulsos.",
  "Diversificación: No pongas todos tus ahorros en un solo lugar; reparte el riesgo.",
  "Presupuesto Base Cero: Asigna cada peso de tus ingresos a una categoría antes de que empiece el mes.",
  "Revisa tus suscripciones: Cancela aquello que no usas; esos cobros automáticos drenan tu cuenta.",
  "Metas SMART: Define objetivos financieros que sean Específicos, Medibles, Alcanzables, Relevantes y con Tiempo.",
  "Inflación del estilo de vida: Si tus ingresos suben, intenta mantener tus gastos igual para ahorrar la diferencia.",
  "Seguros: No son un gasto, son una inversión para proteger tu patrimonio ante desastres.",
  "Tarjetas de Crédito: Úsalas como medio de pago, no como extensión de tu sueldo. Paga siempre el total.",
  "Educación Financiera: Invierte tiempo en aprender sobre finanzas; es el activo con mejor retorno.",
  "Comparar es ahorrar: Antes de una compra grande, compara al menos en tres lugares distintos.",
  "Día sin gastos: Intenta tener un día a la semana donde no gastes absolutamente nada.",
  "Compras de despensa: Nunca vayas al supermercado con hambre o sin una lista definida.",
  "Salud es riqueza: Invertir en tu salud hoy te ahorrará miles en gastos médicos mañana."
];

export const getRandomTip = () => {
  const randomIndex = Math.floor(Math.random() * FINANCIAL_TIPS.length);
  return FINANCIAL_TIPS[randomIndex];
};

export default FINANCIAL_TIPS;
