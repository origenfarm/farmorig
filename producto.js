/* ============================================
   FARMA ORIGEN — Página de producto
   Lê ?sku=xxx, busca em window.FO_PRODUCTS,
   monta galeria, kits, entrega por região e relacionados.
   ============================================ */

(function product() {
  const params = new URLSearchParams(location.search);
  const sku = (params.get('sku') || '').trim();
  const list = window.FO_PRODUCTS || [];
  const data = list.find(p => p.sku === sku) || list[0]; // fallback ao primeiro

  if (!data) {
    document.getElementById('pdGrid').innerHTML =
      '<p style="padding:60px;text-align:center;">Producto no encontrado.</p>';
    return;
  }

  document.title = `${data.fullName} — Farma Origen`;

  /* ---------- CATEGORIA + DISCLAIMER (white-hat) ---------- */
  const CATEGORY = {
    // Suplementos alimenticios
    supplement: new Set([
      'melena-leon','reishi','cordyceps','berberina','cardo-mariano','resveratrol',
      'ginkgo','cromo','nmn','nad','liver-complex','tribulus','bacopa','melatonil',
      'quercetina','sambucol','shilajit','vitafer','citracal','complejo-b','neurobionta',
      'biozen','artrisimi'
    ]),
    // Probióticos (suplemento alimenticio especializado)
    probiotic: new Set([
      'alflorex','bioflora','perenteryl','multiflora','lactoflora','enterogermina'
    ]),
    // Cuidado de la piel (cosmético tópico)
    skincare: new Set([
      'cicaplast-b5','dermopure','effaclar-duo','effaclar-serum','eucerin-pigment',
      'eucerin-hyaluron','eucerin-atopicontrol','hyalu-b5','mela-b3','retinal-shot',
      'mixsoon','alopek'
    ]),
    // Protector solar
    sunscreen: new Set(['anthelios-uvmune','heliocare']),
    // Cuidado ocular (lubricante)
    eyecare: new Set(['hyabak','hylo-comod','lagricel','systane-complete','systane-ultra','toptear']),
    // Higiene/cosmético capilar o cuidado tópico
    topical: new Set(['loceryl','dilasedan']),
    // Vías respiratorias / fitoterápico OTC
    herbal_otc: new Set(['kaloba','bisolvon']),
    // Bem-estar circulatório OTC
    circulatory: new Set(['daflon']),
    // Cuidado masculino / fragancia
    fragrance: new Set(['pheromen']),
    // Bem-estar peso (suplemento)
    weight: new Set(['balloon-slim','thermo-slim','lipo6']),
    // Producto sensible (manter no site mas sem claim médico)
    cosmetic_specialty: new Set(['latisse','finaprost'])
  };

  function getCategory(sku) {
    for (const [cat, set] of Object.entries(CATEGORY)) {
      if (set.has(sku)) return cat;
    }
    return 'supplement';
  }

  const COMPLIANCE_TEXT = {
    supplement:    'Suplemento alimenticio. No reemplaza una dieta equilibrada ni constituye tratamiento médico.',
    probiotic:     'Suplemento alimenticio con cultivos. No reemplaza una dieta equilibrada ni constituye tratamiento médico.',
    skincare:      'Producto cosmético de uso tópico. Para uso externo. Si presenta irritación, suspende el uso.',
    sunscreen:     'Producto cosmético de protección solar. Reaplica cada 2 horas y después de baño o sudor intenso.',
    eyecare:       'Producto para cuidado e higiene ocular. Si presentas molestias, consulta a un especialista.',
    topical:       'Producto de uso tópico/personal. Sigue las indicaciones del envase y suspende ante reacciones adversas.',
    herbal_otc:    'Producto a base de extractos botánicos. Sigue las indicaciones del envase. No reemplaza tratamiento médico.',
    circulatory:   'Producto a base de flavonoides. Sigue las indicaciones del envase. No reemplaza tratamiento médico.',
    fragrance:     'Producto cosmético de uso externo. Solo para mayores de 18 años.',
    weight:        'Suplemento alimenticio. No reemplaza una alimentación equilibrada ni el ejercicio. Los resultados varían según cada persona.',
    cosmetic_specialty: 'Producto cosmético de uso tópico. Lee atentamente el inserto del envase antes de usar.'
  };

  const category = getCategory(data.sku);
  document.body.dataset.category = category;
  const complianceEl = document.getElementById('pdCompliance');
  const complianceText = document.getElementById('pdComplianceText');
  if (complianceText) complianceText.textContent = COMPLIANCE_TEXT[category] || COMPLIANCE_TEXT.supplement;

  /* ---------- TITLE + META ---------- */
  document.getElementById('pdTitle').textContent = data.fullName;

  // Meta description white-hat (sem claims médicos)
  const META_DESC = {
    supplement: `${data.fullName}. Suplemento alimenticio disponible en Farma Origen con despacho a todo Chile.`,
    probiotic:  `${data.fullName}. Suplemento con cultivos vivos disponible en Farma Origen con despacho a todo Chile.`,
    skincare:   `${data.fullName}. Producto de cuidado de la piel disponible en Farma Origen con despacho a todo Chile.`,
    sunscreen:  `${data.fullName}. Protector solar disponible en Farma Origen con despacho a todo Chile.`,
    eyecare:    `${data.fullName}. Cuidado e higiene ocular disponible en Farma Origen con despacho a todo Chile.`,
    topical:    `${data.fullName}. Producto de uso tópico disponible en Farma Origen con despacho a todo Chile.`,
    herbal_otc: `${data.fullName}. Producto a base de extractos botánicos. Despacho a todo Chile.`,
    circulatory:`${data.fullName}. Producto a base de flavonoides. Despacho a todo Chile.`,
    fragrance:  `${data.fullName}. Fragancia masculina. Solo para mayores de 18 años. Despacho a todo Chile.`,
    weight:     `${data.fullName}. Suplemento alimenticio. Resultados varían. Despacho a todo Chile.`,
    cosmetic_specialty: `${data.fullName}. Producto cosmético tópico. Despacho a todo Chile.`
  };
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', META_DESC[category] || META_DESC.supplement);

  // JSON-LD Product schema
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: data.fullName,
    brand: { '@type': 'Brand', name: data.brand || 'Origen Natural' },
    category: ({
      supplement:'Health & Wellness > Supplements',
      probiotic:'Health & Wellness > Supplements > Probiotics',
      skincare:'Beauty > Skin Care',
      sunscreen:'Beauty > Sun Care',
      eyecare:'Health & Personal Care > Eye Care',
      topical:'Health & Personal Care',
      herbal_otc:'Health & Wellness > Herbal',
      circulatory:'Health & Wellness',
      fragrance:'Beauty > Fragrance',
      weight:'Health & Wellness > Supplements',
      cosmetic_specialty:'Beauty > Skin Care'
    })[category] || 'Health & Wellness',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'CLP',
      price: data.price,
      availability: 'https://schema.org/InStock'
    }
  });
  document.head.appendChild(ld);
  document.getElementById('pdBrand').textContent = data.brand || '';
  document.getElementById('pdInfoBrand').textContent = data.brand || '—';

  // Presentación = parte después del primer "·" en fullName
  const pres = data.fullName.split('·')[1]?.trim() || data.fullName;
  document.getElementById('pdInfoPres').textContent = pres;

  // Copy customizado por SKU (sobrepõe a descrição genérica da categoria).
  // Adicione aqui produtos que precisam de texto específico.
  // PRODUCT_COPY agora aceita HTML estruturado.
  // Usa template strings com markup, renderizado via innerHTML.
  // Sem claims médicos, sem promessas de resultado.
  const PRODUCT_COPY = {
    'balloon-slim': `
<p class="pd-desc-lead">Suplemento alimenticio en cápsulas a base de fibras vegetales con tecnología <strong>Hydro Slim™</strong>, pensado como apoyo dietético complementario para adultos.</p>

<section class="pd-desc-block">
  <h4>¿Cómo funciona la fibra?</h4>
  <ol class="pd-steps">
    <li><span class="pd-step-num">1</span><div><strong>Hidratación:</strong> ingieres 2 cápsulas con un vaso grande de agua antes de la comida.</div></li>
    <li><span class="pd-step-num">2</span><div><strong>Volumen:</strong> las fibras se hidratan y aumentan suavemente su volumen en el estómago.</div></li>
    <li><span class="pd-step-num">3</span><div><strong>Saciedad temporal:</strong> esto puede contribuir a una sensación de plenitud antes de las comidas.</div></li>
    <li><span class="pd-step-num">4</span><div><strong>Tránsito natural:</strong> la fibra sigue su recorrido digestivo y no es absorbida por el organismo.</div></li>
  </ol>
</section>

<section class="pd-desc-block">
  <h4>Composición</h4>
  <ul class="pd-chips">
    <li>Hydro Slim™ · fibra vegetal soluble e insoluble</li>
    <li>Cápsula HPMC de origen vegetal</li>
    <li>Sin gluten</li>
    <li>Sin azúcar añadida</li>
    <li>Sin colorantes artificiales</li>
  </ul>
</section>

<section class="pd-desc-block pd-desc-usage">
  <h4>Modo de uso sugerido</h4>
  <p><strong>2 cápsulas</strong> con un vaso grande de agua (mínimo 250 ml), <strong>20 minutos antes</strong> del almuerzo y la cena.</p>
  <p>Mantén una buena hidratación durante el día (1,5 a 2 L de agua). La hidratación es esencial para que las fibras funcionen como se describe.</p>
</section>

<section class="pd-desc-block pd-desc-warn">
  <h4>Información importante</h4>
  <p>Producto exclusivo para <strong>adultos mayores de 18 años</strong>. No usar en menores de edad.</p>
  <p><strong>Consulta a un profesional antes de usar</strong> si tienes dificultad para tragar, antecedentes de obstrucción intestinal, divertículos, esofagitis, hernia hiatal, estás embarazada, en lactancia, tienes alguna condición de salud preexistente o utilizas medicamentos.</p>
  <p class="pd-desc-disclaimer">Suplemento alimenticio. No es un medicamento, no constituye tratamiento médico, no reemplaza una alimentación equilibrada ni el ejercicio. Los resultados pueden variar según el estilo de vida y características de cada persona.</p>
</section>`
  };

  // Descripción genérica white-hat por categoría — sem claims médicos
  const DESC_BY_CAT = {
    supplement:
      `${data.fullName} es un suplemento alimenticio de ${data.brand || 'origen seleccionado'}, disponible en Farma Origen con despacho a todo Chile y garantía de autenticidad. Sigue las indicaciones del envase y consulta a un profesional de la salud antes de iniciar cualquier suplemento.`,
    probiotic:
      `${data.fullName} es un suplemento alimenticio con cultivos vivos de ${data.brand || 'origen seleccionado'}. Sigue las indicaciones del envase. No reemplaza una alimentación equilibrada. Consulta a un profesional ante dudas.`,
    skincare:
      `${data.fullName} es un producto cosmético de cuidado de la piel de ${data.brand || 'origen seleccionado'}. Para uso tópico externo. Realiza prueba de tolerancia en una zona pequeña antes del primer uso.`,
    sunscreen:
      `${data.fullName} es un protector solar cosmético de ${data.brand || 'origen seleccionado'}. Aplica generosamente 15 minutos antes de la exposición y reaplica cada 2 horas o tras baño/sudor intenso.`,
    eyecare:
      `${data.fullName} es un producto para higiene y lubricación ocular de ${data.brand || 'origen seleccionado'}. Sigue las indicaciones del envase y consulta a un oftalmólogo si las molestias persisten.`,
    topical:
      `${data.fullName} es un producto de uso tópico/personal de ${data.brand || 'origen seleccionado'}. Para uso externo. Sigue siempre las indicaciones del envase original.`,
    herbal_otc:
      `${data.fullName} es un producto a base de extractos botánicos de ${data.brand || 'origen seleccionado'}. Sigue las indicaciones del envase. No reemplaza un tratamiento médico ni el diagnóstico de un profesional.`,
    circulatory:
      `${data.fullName} es un producto a base de flavonoides de ${data.brand || 'origen seleccionado'}. Sigue las indicaciones del envase. Consulta a un profesional de la salud ante dudas.`,
    fragrance:
      `${data.fullName} es una fragancia cosmética de uso externo, exclusiva para mayores de 18 años. Disponible en Farma Origen con despacho a todo Chile.`,
    weight:
      `${data.fullName} es un suplemento alimenticio de ${data.brand || 'origen seleccionado'}. Los resultados pueden variar según cada persona. No reemplaza una alimentación equilibrada ni el ejercicio. Consulta a un profesional de la salud antes de usar.`,
    cosmetic_specialty:
      `${data.fullName} es un producto cosmético de uso tópico de ${data.brand || 'origen seleccionado'}. Lee atentamente las instrucciones del envase antes de usar. Para uso externo.`
  };
  // Renderização da descrição:
  // - Se PRODUCT_COPY traz HTML (começa com '<'), renderiza via innerHTML.
  // - Caso contrário, divide em parágrafos por \n\n (textContent escapado).
  const rawDesc = PRODUCT_COPY[data.sku] || DESC_BY_CAT[category] || DESC_BY_CAT.supplement;
  const descEl = document.getElementById('pdDescText');
  descEl.outerHTML = '<div id="pdDescText" class="pd-desc-body"></div>';
  const newDescEl = document.getElementById('pdDescText');
  const trimmed = String(rawDesc).trim();
  if (trimmed.startsWith('<')) {
    newDescEl.innerHTML = trimmed;
  } else {
    trimmed.split(/\n\s*\n/).forEach(para => {
      const p = document.createElement('p');
      p.textContent = para.trim();
      newDescEl.appendChild(p);
    });
  }

  /* ---------- BADGE ---------- */
  if (data.badge) {
    const b = document.getElementById('pdBadge');
    b.textContent = data.badge;
    b.hidden = false;
    const bd = data.badge.toLowerCase();
    if (bd.includes('top'))     b.classList.add('gold');
    else if (bd.includes('nat')) b.classList.add('green');
    else if (bd.includes('%') || bd.includes('off') || bd.includes('promo')) b.classList.add('terracota');
    else b.classList.add('green');
  }

  /* ---------- PRECIO ---------- */
  const fmt = n => '$' + n.toLocaleString('es-CL');
  document.getElementById('pdNow').textContent = fmt(data.price);
  if (data.oldPrice) {
    const old = document.getElementById('pdOld');
    old.textContent = fmt(data.oldPrice);
    old.hidden = false;
    const disc = Math.round((1 - data.price / data.oldPrice) * 100);
    const d = document.getElementById('pdDisc');
    d.textContent = `-${disc}%`;
    d.hidden = false;
  }
  // Cuotas (3x sin interés)
  document.getElementById('pdInstall').innerHTML =
    `o 3 cuotas de <strong>${fmt(Math.ceil(data.price / 3))}</strong> sin interés`;

  /* ---------- KIT PRICES ----------
     Default: 2x e 3x do preço unitário.
     Override por SKU em CUSTOM_KITS quando precisar de preço fixo. */
  const CUSTOM_KITS = {
    'balloon-slim': { kit3: 54900, kit5: 79900 }
  };
  const kitOver = CUSTOM_KITS[data.sku] || {};
  const kit3Price = kitOver.kit3 || data.price * 2;
  const kit5Price = kitOver.kit5 || data.price * 3;
  document.querySelector('[data-target="single"]').textContent = fmt(data.price);
  document.querySelector('[data-target="kit3x2"]').textContent = fmt(kit3Price);
  document.querySelector('[data-target="kit5x3"]').textContent = fmt(kit5Price);
  // % de economia dinâmica (refletindo kit custom ou default)
  const save3pct = Math.round((1 - kit3Price / (data.price * 3)) * 100);
  const save5pct = Math.round((1 - kit5Price / (data.price * 5)) * 100);
  document.querySelector('[data-target="kit3x2-save"]').textContent = `Ahorra ${save3pct}%`;
  document.querySelector('[data-target="kit5x3-save"]').textContent = `Ahorra ${save5pct}%`;

  let currentKit = 'single';
  document.querySelectorAll('input[name="pdKit"]').forEach(r => {
    r.addEventListener('change', () => {
      currentKit = r.value;
      document.querySelectorAll('.pd-kit-opt').forEach(o => o.classList.remove('selected'));
      r.closest('.pd-kit-opt').classList.add('selected');
      updateAddBtn();
    });
  });

  /* ---------- GALLERY ---------- */
  const exts = ['jpg', 'jpeg', 'png', 'webp'];
  const main = document.getElementById('pdMainImg');
  const thumbs = document.getElementById('pdThumbs');
  main.alt = data.fullName;

  const placeholder =
    `https://placehold.co/800x800/1F4D3D/F4EFE6?text=${encodeURIComponent(data.name)}&font=raleway`;
  main.src = placeholder;

  // Try {sku}.jpg, then {sku}_1..._12.{ext}
  const candidates = [];
  for (const ext of exts) candidates.push(`assets/products/${sku}.${ext}`);
  for (let i = 1; i <= 12; i++)
    for (const ext of exts) candidates.push(`assets/products/${sku}_${i}.${ext}`);

  const found = [];
  let pending = candidates.length;

  candidates.forEach((url, idx) => {
    const test = new Image();
    test.onload = () => {
      found.push({ url, idx });
      if (--pending === 0) renderGallery();
    };
    test.onerror = () => { if (--pending === 0) renderGallery(); };
    test.src = url;
  });

  function renderGallery() {
    if (!found.length) return;
    found.sort((a, b) => a.idx - b.idx);
    // dedupe by url
    const seen = new Set();
    const unique = found.filter(f => !seen.has(f.url) && seen.add(f.url));
    main.src = unique[0].url;
    thumbs.innerHTML = '';
    unique.slice(0, 6).forEach((f, i) => {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'pd-thumb' + (i === 0 ? ' active' : '');
      t.innerHTML = `<img src="${f.url}" alt="${data.name} foto ${i+1}" loading="lazy" />`;
      t.addEventListener('click', () => {
        main.src = f.url;
        thumbs.querySelectorAll('.pd-thumb').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
      });
      thumbs.appendChild(t);
    });
  }

  /* ---------- QTY + ADD TO CART ---------- */
  const qty = document.getElementById('qtyInput');
  document.getElementById('qtyMinus').addEventListener('click', () => {
    qty.value = Math.max(1, (parseInt(qty.value) || 1) - 1); updateAddBtn();
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    qty.value = Math.min(99, (parseInt(qty.value) || 1) + 1); updateAddBtn();
  });
  qty.addEventListener('input', updateAddBtn);

  const addBtn = document.getElementById('pdAdd');

  function updateAddBtn() {
    const q = Math.max(1, parseInt(qty.value) || 1);
    let btnSku  = data.sku;
    let btnName = data.name;
    let btnPrice = data.price;
    if (currentKit === 'kit3x2') {
      btnSku = `${data.sku}-kit3x2`;
      btnName = `${data.name} · Kit Lleva 3 Paga 2`;
      btnPrice = kit3Price;
    } else if (currentKit === 'kit5x3') {
      btnSku = `${data.sku}-kit5x3`;
      btnName = `${data.name} · Kit Lleva 5 Paga 3`;
      btnPrice = kit5Price;
    }
    addBtn.dataset.sku = btnSku;
    addBtn.dataset.name = btnName;
    addBtn.dataset.price = btnPrice;
    addBtn.dataset.qty = q;

    const total = btnPrice * q;
    addBtn.textContent = `Agregar al carro · ${fmt(total)}`;
  }
  updateAddBtn();

  // Override del handler global (script.js) para respeitar a quantidade
  addBtn.addEventListener('click', e => {
    e.stopImmediatePropagation();
    e.preventDefault();
    const item = {
      sku: addBtn.dataset.sku,
      name: addBtn.dataset.name,
      price: parseInt(addBtn.dataset.price, 10) || 0
    };
    const q = parseInt(addBtn.dataset.qty, 10) || 1;
    for (let i = 0; i < q; i++) cart.add(item);
    const original = addBtn.innerHTML;
    addBtn.innerHTML = `✓ ${q} agregado${q > 1 ? 's' : ''} al carro`;
    addBtn.classList.add('added');
    setTimeout(() => { addBtn.innerHTML = original; addBtn.classList.remove('added'); updateAddBtn(); }, 1600);
  }, true);

  /* ---------- REGION + DELIVERY ---------- */
  const COMUNAS = {
    XV: ['Arica', 'Putre', 'General Lagos', 'Camarones'],
    I:  ['Iquique', 'Alto Hospicio', 'Pozo Almonte'],
    II: ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones'],
    III:['Copiapó', 'Vallenar', 'Caldera', 'Chañaral'],
    IV: ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel'],
    V:  ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Concón', 'San Antonio', 'Quillota'],
    RM: ['Santiago', 'Providencia', 'Las Condes', 'Vitacura', 'Lo Barnechea', 'Ñuñoa', 'La Reina',
         'Maipú', 'Puente Alto', 'La Florida', 'Peñalolén', 'San Miguel', 'Estación Central',
         'Macul', 'Quilicura', 'Independencia', 'Recoleta', 'Pudahuel'],
    VI: ['Rancagua', 'Machalí', 'San Fernando', 'Rengo', 'Santa Cruz'],
    VII:['Talca', 'Curicó', 'Linares', 'Constitución'],
    XVI:['Chillán', 'San Carlos', 'Bulnes'],
    VIII:['Concepción', 'Talcahuano', 'Chiguayante', 'San Pedro de la Paz', 'Hualpén', 'Coronel', 'Los Ángeles'],
    IX: ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Angol'],
    XIV:['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli'],
    X:  ['Puerto Montt', 'Osorno', 'Castro', 'Ancud', 'Puerto Varas'],
    XI: ['Coyhaique', 'Aysén'],
    XII:['Punta Arenas', 'Puerto Natales', 'Porvenir']
  };
  const FAST_REGIONS = ['RM', 'V', 'VIII']; // entrega rápida solo en estas regiones
  const REGION_NAME = {
    XV:'Arica y Parinacota', I:'Tarapacá', II:'Antofagasta', III:'Atacama', IV:'Coquimbo',
    V:'Valparaíso', RM:'Metropolitana', VI:"O'Higgins", VII:'Maule', XVI:'Ñuble',
    VIII:'Biobío', IX:'Araucanía', XIV:'Los Ríos', X:'Los Lagos', XI:'Aysén', XII:'Magallanes'
  };

  const regionEl = document.getElementById('pdRegion');
  const comunaEl = document.getElementById('pdComuna');
  const hint     = document.getElementById('pdRegionHint');
  const listEl   = document.getElementById('pdDeliveryList');
  const cepEl    = document.getElementById('pdCep');
  const cepBtn   = document.getElementById('pdCepBtn');
  const cepFb    = document.getElementById('pdCepFeedback');
  const cepSpin  = document.getElementById('pdCepSpinner');

  /* Mapeo de prefijos de CEP chileno (4 primeros dígitos) → región
     Cobertura aproximada para fallback cuando la API no responde. */
  const CEP_PREFIX_REGION = {
    // Arica y Parinacota: 1000000-1099999
    '10': 'XV', '11': 'XV',
    // Tarapacá: 1100000-1259999
    '12': 'I',
    // Antofagasta: 1240000-1389999
    '13': 'II',
    // Atacama: 1530000-1719999
    '14': 'III', '15': 'III',
    // Coquimbo: 1700000-1899999
    '16': 'IV', '17': 'IV',
    // Valparaíso: 2340000-2880000
    '23': 'V', '24': 'V', '25': 'V', '26': 'V', '27': 'V', '28': 'V',
    // O'Higgins: 2940000-3160000
    '29': 'VI', '30': 'VI', '31': 'VI',
    // Maule: 3340000-3690000
    '33': 'VII', '34': 'VII', '35': 'VII', '36': 'VII',
    // Ñuble: 3780000-3890000
    '37': 'XVI', '38': 'XVI',
    // Biobío: 4030000-4470000
    '40': 'VIII', '41': 'VIII', '42': 'VIII', '43': 'VIII', '44': 'VIII',
    // Araucanía: 4670000-4890000
    '46': 'IX', '47': 'IX', '48': 'IX',
    // Los Ríos: 5090000-5200000
    '50': 'XIV', '51': 'XIV', '52': 'XIV',
    // Los Lagos: 5290000-5710000
    '53': 'X', '54': 'X', '55': 'X', '56': 'X', '57': 'X',
    // Aysén: 5950000-6010000
    '59': 'XI', '60': 'XI',
    // Magallanes: 6160000-6360000
    '61': 'XII', '62': 'XII', '63': 'XII',
    // Metropolitana: 7500000-9250000
    '75': 'RM', '76': 'RM', '77': 'RM', '78': 'RM', '79': 'RM',
    '80': 'RM', '81': 'RM', '82': 'RM', '83': 'RM', '84': 'RM',
    '85': 'RM', '86': 'RM', '87': 'RM', '88': 'RM', '89': 'RM',
    '90': 'RM', '91': 'RM', '92': 'RM'
  };

  // Restaurar región guardada
  const saved = JSON.parse(localStorage.getItem('fo_region') || 'null');
  if (saved?.region) {
    regionEl.value = saved.region;
    fillComunas(saved.region);
    if (saved.comuna) comunaEl.value = saved.comuna;
  }
  if (saved?.cep) cepEl.value = saved.cep;

  regionEl.addEventListener('change', () => {
    fillComunas(regionEl.value);
    saveRegion();
    renderDelivery();
  });
  comunaEl.addEventListener('change', () => {
    saveRegion();
    renderDelivery();
  });

  /* ---------- CEP LOOKUP ---------- */
  cepEl.addEventListener('input', () => {
    cepEl.value = cepEl.value.replace(/\D/g, '').slice(0, 8);
    cepFb.textContent = '';
    cepFb.className = 'pd-cep-feedback';
  });
  cepEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); lookupCep(); } });
  cepBtn.addEventListener('click', lookupCep);
  cepEl.addEventListener('blur', () => { if (cepEl.value.length >= 7) lookupCep(); });

  async function lookupCep() {
    const cp = cepEl.value.trim();
    if (cp.length < 7) {
      showCepMsg('Ingresa un código postal de 7 dígitos.', 'error');
      return;
    }
    cepSpin.hidden = false;
    cepBtn.disabled = true;
    showCepMsg('Buscando…', 'loading');

    let region = null;
    let comuna = null;
    let placeName = null;

    try {
      const r = await fetch(`https://api.zippopotam.us/cl/${cp}`, { mode: 'cors' });
      if (r.ok) {
        const j = await r.json();
        const place = j.places?.[0];
        if (place) {
          placeName = place['place name'];
          const stateAbbr = place['state abbreviation'];
          const stateName = place['state'];
          region = mapZippoState(stateAbbr, stateName);
          comuna = placeName;
        }
      }
    } catch (e) {
      // Si la API falla (offline, CORS, etc.) caemos al fallback de prefijo
    }

    if (!region) {
      // Fallback por prefijo
      const pref = cp.slice(0, 2);
      region = CEP_PREFIX_REGION[pref] || null;
    }

    cepSpin.hidden = true;
    cepBtn.disabled = false;

    if (!region) {
      showCepMsg('No reconocemos ese código postal. Selecciona tu región manualmente.', 'error');
      document.querySelector('.pd-manual')?.setAttribute('open', '');
      return;
    }

    regionEl.value = region;
    fillComunas(region);
    if (comuna) {
      // intenta marcar la comuna si aparece en el listado
      const opt = Array.from(comunaEl.options).find(o => o.value.toLowerCase() === comuna.toLowerCase());
      comunaEl.value = opt ? opt.value : '';
    }

    const regName = REGION_NAME[region];
    const detail = placeName
      ? `${placeName}, ${regName}`
      : regName;
    showCepMsg(`✓ ${detail}`, 'ok');
    saveRegion();
    renderDelivery();
  }

  function showCepMsg(msg, kind) {
    cepFb.textContent = msg;
    cepFb.className = `pd-cep-feedback ${kind || ''}`;
  }

  function mapZippoState(abbr, name) {
    if (!abbr && !name) return null;
    const a = (abbr || '').toUpperCase();
    if (REGION_NAME[a]) return a;
    const n = (name || '').toLowerCase();
    if (n.includes('metropolitana') || n.includes('santiago')) return 'RM';
    if (n.includes('arica'))     return 'XV';
    if (n.includes('tarapac'))   return 'I';
    if (n.includes('antofag'))   return 'II';
    if (n.includes('atacama'))   return 'III';
    if (n.includes('coquimbo'))  return 'IV';
    if (n.includes('valpara'))   return 'V';
    if (n.includes('higgins'))   return 'VI';
    if (n.includes('maule'))     return 'VII';
    if (n.includes('ñuble') || n.includes('nuble')) return 'XVI';
    if (n.includes('biob'))      return 'VIII';
    if (n.includes('arauca'))    return 'IX';
    if (n.includes('ríos') || n.includes('rios')) return 'XIV';
    if (n.includes('lagos'))     return 'X';
    if (n.includes('aysén') || n.includes('aysen')) return 'XI';
    if (n.includes('magall'))    return 'XII';
    return null;
  }

  function fillComunas(reg) {
    if (!reg || !COMUNAS[reg]) {
      comunaEl.innerHTML = '<option value="">Comuna</option>';
      comunaEl.disabled = true;
      return;
    }
    comunaEl.disabled = false;
    comunaEl.innerHTML = '<option value="">Selecciona tu comuna</option>' +
      COMUNAS[reg].map(c => `<option value="${c}">${c}</option>`).join('');
  }

  function saveRegion() {
    localStorage.setItem('fo_region', JSON.stringify({
      region: regionEl.value, comuna: comunaEl.value, cep: cepEl.value
    }));
  }

  renderDelivery();

  function renderDelivery() {
    const reg = regionEl.value;
    const com = comunaEl.value;

    if (!reg) {
      hint.textContent = 'Ingresa tu código postal para ver disponibilidad y tiempos de entrega.';
      listEl.innerHTML = `
        <li class="pd-deliv pd-deliv-empty">
          <div class="pd-deliv-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div class="pd-deliv-body">
            <strong>Aún no sabemos a dónde despachar</strong>
            <small>Ingresa tu código postal arriba y te mostraremos las opciones disponibles en tu zona.</small>
          </div>
        </li>`;
      return;
    }

    const fast = FAST_REGIONS.includes(reg);
    const regName = REGION_NAME[reg];
    hint.innerHTML = com
      ? `Mostrando opciones para <strong>${com}, ${regName}</strong>.`
      : `Mostrando opciones para la región <strong>${regName}</strong>. Selecciona tu comuna para refinar.`;

    listEl.innerHTML = `
      <li class="pd-deliv pd-deliv-off">
        <div class="pd-deliv-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div class="pd-deliv-body">
          <div class="pd-deliv-top">
            <strong>Compra presencial o retiro en sucursal</strong>
            <span class="pd-deliv-tag red">No disponible en tu región</span>
          </div>
          <small>Por ahora no contamos con sucursales físicas en ${regName}. Estamos expandiendo nuestra red — ¡pronto llegaremos a ti!</small>
        </div>
      </li>

      <li class="pd-deliv pd-deliv-ok">
        <div class="pd-deliv-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        </div>
        <div class="pd-deliv-body">
          <div class="pd-deliv-top">
            <strong>Entrega a domicilio</strong>
            <span class="pd-deliv-tag green">Disponible · 24 a 48 h</span>
          </div>
          <small>Despacho a ${com || regName} con Chilexpress / Starken. <strong>Gratis</strong> en compras sobre $30.000.</small>
        </div>
      </li>

      <li class="pd-deliv ${fast ? 'pd-deliv-ok pd-deliv-fast' : 'pd-deliv-off'}">
        <div class="pd-deliv-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <div class="pd-deliv-body">
          <div class="pd-deliv-top">
            <strong>Entrega rápida · Misma tarde</strong>
            <span class="pd-deliv-tag ${fast ? 'gold' : 'gray'}">
              ${fast ? `Disponible hoy · 90 min · $4.990` : 'No disponible en tu región'}
            </span>
          </div>
          <small>${fast
            ? `Pide antes de las 18:00 y recibe el mismo día con nuestra flota de motos en ${com || regName}.`
            : 'Por ahora la entrega rápida solo está activa en RM, Valparaíso y Biobío.'}</small>
        </div>
      </li>
    `;
  }

  /* ---------- RELACIONADOS ---------- */
  (function related() {
    const grid = document.getElementById('pdRelated');
    if (!grid) return;
    const others = list.filter(p => p.sku !== data.sku);
    // pick 4 random-ish (use sku hash for stability)
    const sample = [];
    const used = new Set();
    while (sample.length < 4 && used.size < others.length) {
      const i = Math.floor(Math.random() * others.length);
      if (!used.has(i)) { used.add(i); sample.push(others[i]); }
    }
    grid.innerHTML = sample.map(p => `
      <article class="product" data-link-sku="${p.sku}">
        <div class="prod-img">
          ${p.badge ? `<span class="badge ${badgeClass(p.badge)}">${p.badge}</span>` : ''}
          <span class="badge-fav">♡</span>
          <img src="https://placehold.co/600x600/1F4D3D/F4EFE6?text=${encodeURIComponent(p.name)}&font=raleway" alt="${p.name}" loading="lazy" />
        </div>
        <div class="prod-info">
          <span class="prod-brand">${p.brand}</span>
          <h3 class="prod-name">${p.fullName}</h3>
          <div class="prod-price">
            ${p.oldPrice ? `<span class="old">$${p.oldPrice.toLocaleString('es-CL')}</span>` : ''}
            <strong>$${p.price.toLocaleString('es-CL')}</strong>
          </div>
          <button class="btn btn-add" data-action="checkout" data-sku="${p.sku}" data-name="${p.name}" data-price="${p.price}">Agregar al carro</button>
        </div>
      </article>
    `).join('');

    // re-aplicar auto-swap nas cards relacionadas
    grid.querySelectorAll('.product').forEach(card => {
      const btn = card.querySelector('[data-sku]');
      const img = card.querySelector('.prod-img img');
      if (!btn || !img) return;
      const s = btn.dataset.sku.toLowerCase();
      let i = 0;
      const tryNext = () => {
        if (i >= exts.length) return;
        const url = `assets/products/${s}.${exts[i++]}`;
        const test = new Image();
        test.onload = () => { img.src = url; };
        test.onerror = tryNext;
        test.src = url;
      };
      tryNext();

      // navegar ao clicar na imagem ou no nome
      card.querySelector('.prod-img').addEventListener('click', () => location.href = `/productos/${s}`);
      card.querySelector('.prod-name').addEventListener('click', () => location.href = `/productos/${s}`);
    });
  })();

  function badgeClass(b) {
    const x = b.toLowerCase();
    if (x.includes('top'))     return 'gold';
    if (x.includes('nat'))     return 'green';
    if (x.includes('off'))     return 'terracota';
    return 'green';
  }

  /* ---------- TABS ---------- */
  document.querySelectorAll('.pd-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pd-tab').forEach(t => {
        t.classList.remove('active'); t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.pd-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
      document.querySelector(`.pd-panel[data-panel="${tab.dataset.tab}"]`)?.classList.add('active');
    });
  });

  /* ---------- FAVORITO ---------- */
  document.getElementById('pdFav').addEventListener('click', e => {
    e.currentTarget.classList.toggle('on');
    e.currentTarget.textContent = e.currentTarget.classList.contains('on') ? '♥' : '♡';
  });
})();
