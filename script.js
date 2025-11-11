// Wird automatisch aufgerufen, sobald Alpine geladen ist
document.addEventListener('alpine:init', () => {
  Alpine.data('coffeeApp', () => ({
    // --- Zustand ---
    base: 'espresso',
    strength: 6,
    size: 'm',
    milkType: 'none',
    milkPct: 30,
    sweet: 2,
    temp: 'hot',
    extras: [],
    allExtras: ['Vanille', 'Schokolade', 'Zimt', 'Karamell', 'Orange', 'Prise Salz'],
    copied: false,

    // --- Preise (grob, nur Demo) ---
    PRICE: {
      base: { espresso: 0.5, doppio: 0.9, filter: 0.4, coldbrew: 1.2 },
      size: { s: 0.0, m: 0.2, l: 0.4 },
      milk: { none: 0.0, vollmilch: 0.2, hafer: 0.3, soja: 0.25, mandel: 0.35 },
      extra: 0.1,
    },

    // --- Lifecycle ---
    init() {
      // wenn URL-Parameter vorhanden, Zustand daraus herstellen
      const params = new URLSearchParams(location.search);
      if (params.size)       this.size = params.get('size');
      if (params.base)       this.base = params.get('base');
      if (params.strength)   this.strength = +params.get('strength');
      if (params.milkType)   this.milkType = params.get('milkType');
      if (params.milkPct)    this.milkPct = +params.get('milkPct');
      if (params.sweet)      this.sweet = +params.get('sweet');
      if (params.temp)       this.temp = params.get('temp');
      if (params.extras)     this.extras = params.get('extras').split(',').filter(Boolean);
    },

    // --- Deriviertes ---
    get sizeML() { return this.size === 's' ? 200 : this.size === 'm' ? 300 : 400; },
    get cost() {
      const base = this.PRICE.base[this.base] ?? 0.4;
      const size = this.PRICE.size[this.size] ?? 0;
      const milk = (this.milkType === 'none') ? 0 : (this.PRICE.milk[this.milkType] * (this.milkPct / 40));
      const extras = this.extras.length * this.PRICE.extra;
      const sweet = this.sweet > 0 ? 0.05 + (this.sweet / 20) * 0.05 : 0;
      return Math.max(0.2, +(base + size + milk + extras + sweet).toFixed(2));
    },
    get recipeTitle() {
      const tempEmoji = this.temp === 'hot' ? '🔥' : '🧊';
      const milkEmoji = this.milkType === 'none' ? '🥃' : '🥛';
      return `${tempEmoji} ${milkEmoji} ${this.prettyBase(this.base)}`;
    },
    get recipeText() {
      const parts = [
        `Basis: ${this.prettyBase(this.base)} (${this.strength}/10)`,
        `Größe: ${this.size.toUpperCase()} (${this.sizeML} ml)`,
        `Milch: ${this.milkType === 'none' ? 'keine' : this.cap(this.milkType)} ${this.milkType === 'none' ? '' : `(${this.milkPct}%)`}`,
        `Süße: ${this.sweet}/10`,
        `Temperatur: ${this.temp === 'hot' ? 'heiß' : 'iced'}`,
      ];
      if (this.extras.length) parts.push(`Extras: ${this.extras.join(', ')}`);
      return parts.join(' · ');
    },

    // --- Aktionen ---
    toggleExtra(opt) {
      this.extras = this.extras.includes(opt)
        ? this.extras.filter(x => x !== opt)
        : [...this.extras, opt];
    },
    randomize() {
      const pick = a => a[Math.floor(Math.random() * a.length)];
      this.base = pick(['espresso', 'doppio', 'filter', 'coldbrew']);
      this.size = pick(['s', 'm', 'l']);
      this.temp = pick(['hot', 'iced']);
      this.milkType = pick(['none', 'vollmilch', 'hafer', 'soja', 'mandel']);
      this.milkPct = this.milkType === 'none' ? 0 : [10,20,30,40,50,60].sort(() => 0.5 - Math.random())[0];
      this.strength = Math.ceil(Math.random() * 10);
      this.sweet = Math.floor(Math.random() * 6);
      this.extras = this.allExtras.filter(() => Math.random() < 0.3);
    },
    reset() {
      this.base = 'espresso';
      this.strength = 6;
      this.size = 'm';
      this.milkType = 'none';
      this.milkPct = 30;
      this.sweet = 2;
      this.temp = 'hot';
      this.extras = [];
      this.copied = false;
      history.replaceState({}, '', location.pathname);
    },
    async share() {
      const params = new URLSearchParams({
        base: this.base,
        strength: this.strength,
        size: this.size,
        milkType: this.milkType,
        milkPct: this.milkPct,
        sweet: this.sweet,
        temp: this.temp,
        extras: this.extras.join(','),
      });
      const url = `${location.origin}${location.pathname}?${params.toString()}`;
      try {
        await navigator.clipboard.writeText(url);
        this.copied = true;
        setTimeout(() => (this.copied = false), 1500);
      } catch {
        // Fallback: URL in die Adresszeile schreiben
        location.href = url;
      }
    },

    // --- Utils ---
    formatEuro(n) { return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n); },
    cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); },
    prettyBase(b) { return ({ espresso: 'Espresso', doppio: 'Doppio', filter: 'Filterkaffee', coldbrew: 'Cold Brew' })[b] || b; },
  }));
});

