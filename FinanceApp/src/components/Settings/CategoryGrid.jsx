import React, { useState } from 'react';
import { 
  Utensils, Car, Home, ShoppingBag, Heart, Gamepad, 
  Briefcase, GraduationCap, Plane, Coffee, Tv, Zap, 
  Tag, Plus, Smartphone, PiggyBank, Receipt, Maximize2,
  Wallet, Gift, Landmark, HelpCircle, FileText, Users,
  Dumbbell, Bus, Pizza, Wifi, BarChart3, Bike, Footprints,
  PawPrint, Power, CreditCard, Ruler, Music, Camera,
  Rocket, Star, Gem, Wine, ShieldCheck, Phone,
  Moon, Sun, Key
} from 'lucide-react';

const ICONS = { 
  Utensils, Car, Home, ShoppingBag, Heart, Gamepad, 
  Briefcase, GraduationCap, Plane, Coffee, Tv, Zap, 
  Smartphone, PiggyBank, Receipt, Tag,
  Wallet, Gift, Landmark, HelpCircle, FileText, Users,
  Dumbbell, Bus, Pizza, Wifi, BarChart3, Bike, Footprints,
  PawPrint, Power, CreditCard, Ruler, Music, Camera,
  Rocket, Star, Gem, Wine, ShieldCheck, Phone,
  Moon, Sun, Key
};

const CategoryGrid = ({ categories, onCategoryClick, onCreateClick }) => {
  const [activeTab, setActiveTab] = useState('expense');

  const filteredCategories = categories.filter(c => c.type === activeTab);

  return (
    <div className="animate-fade">
      <div style={styles.topNav}>
        <div style={styles.tabs}>
          <button 
            style={styles.tab(activeTab === 'expense')} 
            onClick={() => setActiveTab('expense')}
          >
            GASTOS
          </button>
          <button 
            style={styles.tab(activeTab === 'income')} 
            onClick={() => setActiveTab('income')}
          >
            INGRESOS
          </button>
        </div>
        <button style={styles.expandBtn}>
          <Maximize2 size={18} />
        </button>
      </div>

      <div style={styles.grid}>
        {filteredCategories.map(cat => {
          const Icon = ICONS[cat.icon] || Tag;
          return (
            <div 
              key={cat.id} 
              style={styles.gridItem} 
              onClick={() => onCategoryClick(cat)}
            >
              <div style={styles.iconCircle(cat.color)}>
                <Icon size={24} />
              </div>
              <span style={styles.catName}>{cat.name}</span>
            </div>
          );
        })}

        <div style={styles.gridItem} onClick={() => onCreateClick(activeTab)}>
          <div style={styles.createCircle}>
            <Plus size={28} />
          </div>
          <span style={styles.catName}>Crear</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  topNav: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  tabs: { display: 'flex', gap: '32px' },
  tab: (active) => ({
    padding: '12px 0', border: 'none', background: 'none',
    color: active ? 'var(--text-heading)' : 'var(--text-muted)',
    fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
    borderBottom: active ? '3px solid var(--secondary)' : '3px solid transparent',
    transition: 'all 0.2s'
  }),
  expandBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px 12px',
    padding: '8px'
  },
  gridItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    cursor: 'pointer'
  },
  iconCircle: (color) => ({
    width: '60px', height: '60px', borderRadius: '50%',
    backgroundColor: color, color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  }),
  createCircle: {
    width: '60px', height: '60px', borderRadius: '50%',
    backgroundColor: '#fbbf24', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  catName: {
    color: 'var(--text-main)', fontSize: '0.75rem', fontWeight: '400',
    textAlign: 'center', width: '100%', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap'
  }
};

export default CategoryGrid;
