/* ═══════════════════════════════════════════════════════════════════
   Honest Plugins — comportamiento compartido
   Sin dependencias. Cada bloque comprueba si su marcado existe.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     CONFIGURACIÓN DEL FORMULARIO — el ÚNICO sitio que hay que tocar.
     Sirve para las cuatro páginas a la vez.

     Opción A · Web3Forms (sin registro):
       1. Entra en web3forms.com y pon tu Gmail. Te mandan una clave.
       2. Pega esa clave en ACCESS_KEY. Listo.

     Opción B · Formspree (con cuenta gratuita):
       1. Crea el formulario, te dan una URL con un id.
       2. Pon esa URL en ENDPOINT y deja ACCESS_KEY como cadena vacía.

     Tu correo NO se escribe aquí a propósito: queda guardado en el
     servicio, no en el código de una página pública, así que los
     rastreadores de spam no pueden leerlo.
     ══════════════════════════════════════════════════════════════ */
  var CONTACT = {
    ENDPOINT:   'https://api.web3forms.com/submit',
    ACCESS_KEY: 'f92afd4f-775e-4d67-aca1-ed4515042065'
  };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════════════════════════════════════════════════════════
     TEXTOS QUE GENERA EL JAVASCRIPT
     El HTML lo traduce cada página; esto es lo que se escribe en
     tiempo de ejecución (simulador, configurador, formulario) y no
     estaría traducido si no viviera aquí.

     Para añadir un idioma: copiar el bloque 'en', traducirlo, y
     ponerlo bajo su código. Lo que falte cae a inglés.
     ══════════════════════════════════════════════════════════════ */
  var IDIOMA = (document.documentElement.lang || 'en').slice(0, 2);

  var TEXTOS = {
    en: {
      selloExport: 'Export · 0 %',
      selloNacional: 'Domestic · 21 %',
      selloInversion: 'Reverse charge · 0 %',
      selloSinNif: 'No VAT ID · ',
      selloOss: 'OSS · ',
      porExport: 'Sale outside the EU. <b>Export — no VAT charged.</b>',
      porNacionalB2B: 'Business customer in the same country as the store. <b>Reverse charge does not apply domestically</b>, so normal Spanish VAT is charged.',
      porNacionalB2C: 'Consumer in the store’s own country. <b>Domestic VAT applies</b>, shown inclusive of tax.',
      porInversion: 'Business customer in another member state with a VAT number validated against VIES. <b>Intra-Community supply — reverse charge.</b> The buyer accounts for the VAT.',
      porSinNif: 'Business customer in another member state, but <b>no VAT number given</b>, so the exemption cannot be applied. Treated as a consumer: destination-country VAT.',
      porOss: 'Consumer in another member state. <b>Destination-country VAT</b> under the One-Stop Shop rules.',
      etiquetaIva: 'VAT',
      soloPro: 'Pro only',
      unAddon: ' add-on',
      variosAddons: ' add-ons',
      enviando: 'Sending…',
      enviado: 'Thanks — your message has been sent. You will get a real answer, usually within a day.',
      errorServidor: '. Please try again in a moment.',
      errorRed: 'Could not reach the server. Check your connection and try again.',
      sinConfigurar: 'This form is not connected yet. Set the access key in assets/site.js.'
    },
    es: {
      selloExport: 'Exportación · 0 %',
      selloNacional: 'Nacional · 21 %',
      selloInversion: 'Inversión del sujeto pasivo · 0 %',
      selloSinNif: 'Sin NIF-IVA · ',
      selloOss: 'OSS · ',
      porExport: 'Venta fuera de la UE. <b>Exportación — no se repercute IVA.</b>',
      porNacionalB2B: 'Cliente empresa en el mismo país que la tienda. <b>La inversión del sujeto pasivo no aplica en operaciones nacionales</b>, así que se repercute el IVA español normal.',
      porNacionalB2C: 'Consumidor en el país de la propia tienda. <b>Se aplica el IVA nacional</b>, mostrado con impuestos incluidos.',
      porInversion: 'Cliente empresa en otro estado miembro con NIF-IVA validado en VIES. <b>Entrega intracomunitaria — inversión del sujeto pasivo.</b> El IVA lo liquida el comprador.',
      porSinNif: 'Cliente empresa en otro estado miembro, pero <b>sin NIF-IVA</b>, así que no se puede aplicar la exención. Se trata como consumidor: IVA del país de destino.',
      porOss: 'Consumidor en otro estado miembro. <b>IVA del país de destino</b> según las reglas de la ventanilla única (OSS).',
      etiquetaIva: 'IVA',
      soloPro: 'Solo Pro',
      unAddon: ' añadido',
      variosAddons: ' añadidos',
      enviando: 'Enviando…',
      enviado: 'Gracias — tu mensaje se ha enviado. Recibirás una respuesta de verdad, normalmente en un día.',
      errorServidor: '. Inténtalo otra vez en un momento.',
      errorRed: 'No se ha podido contactar con el servidor. Comprueba tu conexión e inténtalo de nuevo.',
      sinConfigurar: 'Este formulario aún no está conectado. Pon la clave de acceso en assets/site.js.'
    },
    sw: {
      selloExport: 'Nje ya EU · 0 %',
      selloNacional: 'Ndani ya nchi · 21 %',
      selloInversion: 'Mnunuzi analipa VAT · 0 %',
      selloSinNif: 'Hakuna namba ya VAT · ',
      selloOss: 'OSS · ',
      porExport: 'Mauzo nje ya Umoja wa Ulaya. <b>Hakuna VAT inayotozwa.</b>',
      porNacionalB2B: 'Mteja wa biashara katika nchi ile ile ya duka. <b>Sheria ya mnunuzi kulipa VAT haitumiki ndani ya nchi moja</b>, kwa hiyo VAT ya kawaida ya Uhispania inatozwa.',
      porNacionalB2C: 'Mnunuzi wa kawaida katika nchi ya duka. <b>VAT ya ndani inatumika</b>, na bei inaonyeshwa ikiwa na kodi ndani yake.',
      porInversion: 'Mteja wa biashara katika nchi nyingine ya EU mwenye namba ya VAT iliyothibitishwa na VIES. <b>Mauzo ndani ya EU — mnunuzi ndiye analipa VAT.</b>',
      porSinNif: 'Mteja wa biashara katika nchi nyingine ya EU, lakini <b>hakuna namba ya VAT</b>, kwa hiyo msamaha hauwezi kutumika. Anahesabiwa kama mnunuzi wa kawaida: VAT ya nchi anakoenda.',
      porOss: 'Mnunuzi wa kawaida katika nchi nyingine ya EU. <b>VAT ya nchi anakoenda</b> kwa mujibu wa kanuni za One-Stop Shop.',
      etiquetaIva: 'VAT',
      soloPro: 'Pro pekee',
      unAddon: ' nyongeza',
      variosAddons: ' nyongeza',
      enviando: 'Inatuma…',
      enviado: 'Asante — ujumbe wako umetumwa. Utapata jibu la kweli, mara nyingi ndani ya siku moja.',
      errorServidor: '. Tafadhali jaribu tena baada ya muda mfupi.',
      errorRed: 'Imeshindikana kufikia seva. Angalia mtandao wako kisha ujaribu tena.',
      sinConfigurar: 'Fomu hii bado haijaunganishwa. Weka ufunguo katika assets/site.js.'
    }
  };

  var T = TEXTOS[IDIOMA] || TEXTOS.en;
  /* Rellena con inglés cualquier clave que falte en una traducción parcial. */
  Object.keys(TEXTOS.en).forEach(function (k) {
    if (typeof T[k] === 'undefined') T[k] = TEXTOS.en[k];
  });

  /* ── 1. Revelado al entrar en pantalla ────────────────────── */
  (function reveals() {
    var items = document.querySelectorAll('.rv');
    if (!items.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });

    /* Red de seguridad: si algo sigue oculto tres segundos después de cargar
       (observer que nunca dispara, contenedor raro, navegador antiguo), se
       muestra igualmente. Una página de venta nunca puede quedarse en blanco. */
    window.addEventListener('load', function () {
      setTimeout(function () {
        document.querySelectorAll('.rv:not(.in)').forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight) el.classList.add('in');
        });
      }, 3000);
    });
  })();

  /* ── 1b. Altura real de la cabecera → --topbar-h ──────────── */
  (function topbarHeight() {
    var tb = document.querySelector('.topbar');
    if (!tb) return;
    function set() {
      document.documentElement.style.setProperty('--topbar-h', tb.offsetHeight + 'px');
    }
    set();
    window.addEventListener('resize', set);
    window.addEventListener('load', set);
    if (window.ResizeObserver) new ResizeObserver(set).observe(tb);
  })();

  /* ── 1c. Selector de idioma ───────────────────────────────── */
  (function idioma() {
    var select = document.getElementById('lang-select');
    if (!select) return;

    /* Idiomas publicados. El inglés vive en la raíz; el resto en su
       subcarpeta. Añadir uno nuevo = crear su carpeta y su <option>. */
    var CODIGOS = ['es', 'fr', 'de', 'pt', 'sw'];

    /* Ruta base del sitio: '' en un dominio propio o en un sitio de
       organización de GitHub Pages; '/repo' si algún día se sirve desde un
       subdirectorio. Se deduce de dónde está el CSS, que siempre cuelga de
       la raíz del sitio. */
    var css = document.querySelector('link[rel="stylesheet"][href*="site.css"]');
    var base = '';
    if (css) {
      var href = new URL(css.getAttribute('href'), window.location.href).pathname;
      base = href.replace(/\/assets\/site\.css.*$/, '');
    }

    var resto = window.location.pathname.slice(base.length).replace(/^\//, '');
    var trozos = resto.split('/').filter(Boolean);

    var actual = '';
    if (trozos.length && CODIGOS.indexOf(trozos[0]) !== -1) {
      actual = trozos.shift();
    }

    var fichero = trozos.length ? trozos[trozos.length - 1] : 'index.html';
    if (fichero.indexOf('.') === -1) fichero = 'index.html';

    select.value = actual;

    /* Ruta dentro del idioma, conservando subcarpetas: de /es/guias/x.html
       se queda con 'guias/x.html', para que cambiar de idioma no pierda la
       página en la que estás. */
    var resto_ruta = trozos.join('/') || 'index.html';
    if (resto_ruta.indexOf('.') === -1) resto_ruta += '/index.html';

    select.addEventListener('change', function () {
      var destino = select.value;
      var url = base + '/' + (destino ? destino + '/' : '') + resto_ruta;

      /* No todo el contenido existe en los tres idiomas: los artículos, por
         ejemplo, empiezan en uno solo. Si la página equivalente no existe,
         se va a la portada de ese idioma en lugar de a un 404. */
      var respaldo = base + '/' + (destino ? destino + '/' : '') + 'index.html';

      if (!window.fetch) { window.location.href = url; return; }

      fetch(url, { method: 'HEAD' })
        .then(function (r) { window.location.href = r.ok ? url : respaldo; })
        .catch(function () { window.location.href = respaldo; });
    });
  })();

  /* ── 2. Enlace de navegación activo según la sección visible ─ */
  (function scrollSpy() {
    var links = document.querySelectorAll('.subnav a[href^="#"], .nav a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) map[el.id] = a;
    });
    var ids = Object.keys(map);
    if (!ids.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-current'); });
        map[e.target.id].classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach(function (id) { io.observe(document.getElementById(id)); });
  })();

  /* ── 3. Comparativa: mostrar solo las diferencias ─────────── */
  (function cmpFilter() {
    var box = document.getElementById('only-diff');
    if (!box) return;
    var rows = document.querySelectorAll('table.cmp tbody tr');
    box.addEventListener('change', function () {
      rows.forEach(function (tr) {
        tr.hidden = box.checked && tr.dataset.diff !== 'yes';
      });
    });
  })();

  /* ── 4. Simulador de precio e IVA (entrepo.html) ──────────── */
  (function simulator() {
    var root = document.getElementById('sim');
    if (!root) return;

    var LIST = 100;                                   // precio de tarifa, neto
    var GROUPS = {
      retail:      { label: 'Retail (B2C)',   off: 0,    b2b: false },
      wholesale:   { label: 'Wholesale',      off: 0.20, b2b: true  },
      distributor: { label: 'Distributor',    off: 0.35, b2b: true  }
    };
    var COUNTRIES = {
      ES: { label: 'Spain',          eu: true,  domestic: true,  rate: 0.21 },
      DE: { label: 'Germany',        eu: true,  domestic: false, rate: 0.19 },
      GB: { label: 'United Kingdom', eu: false, domestic: false, rate: 0 }
    };

    /* El euro no se escribe igual en todos los idiomas: en inglés va
       delante y con punto decimal (€100.00); en español, francés, alemán
       y portugués va detrás, con espacio duro y coma (100,00 €). Se
       decide por el lang del documento, así que cada traducción lo hereda
       sin tocar nada. */
    var LANG = (document.documentElement.lang || 'en').slice(0, 2);
    var SIMBOLO_DELANTE = ['en', 'sw'].indexOf(LANG) !== -1;

    var euro = function (n) {
      var fijo = n.toFixed(2);
      if (SIMBOLO_DELANTE) {
        return '€' + fijo;
      }
      return fijo.replace('.', ',') + ' €';
    };

    var els = {
      discount: document.getElementById('sim-discount'),
      net:      document.getElementById('sim-net'),
      vatLabel: document.getElementById('sim-vat-label'),
      vat:      document.getElementById('sim-vat'),
      total:    document.getElementById('sim-total'),
      why:      document.getElementById('sim-why'),
      stamp:    document.getElementById('sim-stamp'),
      lines:    document.getElementById('sim-lines')
    };

    function read(name) {
      var el = root.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : null;
    }

    function render(animate) {
      var g = GROUPS[read('group')];
      var c = COUNTRIES[read('country')];
      var hasVat = root.querySelector('input[name="vatid"]:checked').value === 'yes';

      /* el número de IVA solo pinta algo en B2B intracomunitario */
      var vatRelevant = g.b2b && c.eu && !c.domestic;
      root.querySelectorAll('input[name="vatid"]').forEach(function (i) {
        i.disabled = !vatRelevant;
      });

      var net = LIST * (1 - g.off);
      var rate, why, stampClass, stampText;

      if (!c.eu) {
        rate = 0;
        why = T.porExport;
        stampClass = 'stamp pass'; stampText = T.selloExport;
      } else if (c.domestic) {
        rate = c.rate;
        why = g.b2b ? T.porNacionalB2B : T.porNacionalB2C;
        stampClass = 'stamp wait'; stampText = T.selloNacional;
      } else if (g.b2b && hasVat) {
        rate = 0;
        why = T.porInversion;
        stampClass = 'stamp pass'; stampText = T.selloInversion;
      } else if (g.b2b) {
        rate = c.rate;
        why = T.porSinNif;
        stampClass = 'stamp wait'; stampText = T.selloSinNif + Math.round(c.rate * 100) + ' %';
      } else {
        rate = c.rate;
        why = T.porOss;
        stampClass = 'stamp wait'; stampText = T.selloOss + Math.round(c.rate * 100) + ' %';
      }

      var vat = net * rate;

      els.discount.textContent = g.off ? '− ' + euro(LIST * g.off) + '  (' + Math.round(g.off * 100) + ' %)' : '—';
      els.net.textContent = euro(net);
      els.vatLabel.textContent = T.etiquetaIva + ' (' + (rate * 100).toFixed(0) + ' %)';
      els.vat.textContent = rate ? euro(vat) : euro(0);
      els.total.textContent = euro(net + vat);
      els.why.innerHTML = why;
      els.stamp.className = stampClass;
      els.stamp.textContent = stampText;

      if (animate && !reduced) {
        els.lines.classList.remove('flash');
        void els.lines.offsetWidth;
        els.lines.classList.add('flash');
      }
    }

    root.addEventListener('change', function () { render(true); });
    render(false);
  })();

  /* ── 4b. Formulario de contacto ───────────────────────────── */
  (function contactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var status = document.getElementById('form-status');
    var button = form.querySelector('button[type="submit"]');
    var configured = CONTACT.ACCESS_KEY !== 'PEGA_AQUI_TU_CLAVE';

    form.setAttribute('action', CONTACT.ENDPOINT);

    function say(text, kind) {
      status.textContent = text;
      status.className = 'form-status' + (kind ? ' ' + kind : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* trampa antispam: si viene rellena, es un bot. Fingimos éxito. */
      if (form.querySelector('input[name="botcheck"]').value) {
        say(T.enviado, 'ok');
        form.reset();
        return;
      }

      if (!configured) {
        say(T.sinConfigurar, 'bad');
        return;
      }

      var data = Object.fromEntries(new FormData(form).entries());
      data.access_key = CONTACT.ACCESS_KEY;
      data.subject = 'Honest Plugins — ' + (data.product || 'enquiry') + ' — ' + (data.name || 'no name');
      delete data.botcheck;

      button.disabled = true;
      say(T.enviando);

      fetch(CONTACT.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().catch(function () { return { success: r.ok }; }); })
        .then(function (r) {
          if (r.success) {
            form.reset();
            say(T.enviado, 'ok');
          } else {
            say((r.message || 'Error') + T.errorServidor, 'bad');
          }
        })
        .catch(function () {
          say(T.errorRed, 'bad');
        })
        .then(function () { button.disabled = false; });
    });
  })();

  /* ── 5. Configurador de precio con add-ons (malipo.html) ───── */
  (function builder() {
    var root = document.getElementById('builder');
    if (!root) return;

    var BASE = Number(root.dataset.base || 0);
    var CUR = root.dataset.currency || '$';
    var rows = document.getElementById('tally-rows');
    var totalEl = document.getElementById('tally-total');
    var countEl = document.getElementById('tally-count');

    var money = function (n) { return CUR + n.toFixed(0); };

    function render() {
      var picked = Array.prototype.slice.call(
        root.querySelectorAll('input[type="checkbox"]:checked')
      );
      var total = BASE;

      /* construido con nodos, no con innerHTML: nada de esto se concatena */
      function line(name, amount) {
        var row = document.createElement('div');
        row.className = 'tally-row';
        var k = document.createElement('span');
        k.textContent = name;
        var v = document.createElement('span');
        v.className = 'v';
        v.textContent = money(amount);
        row.appendChild(k);
        row.appendChild(v);
        return row;
      }

      var frag = document.createDocumentFragment();
      frag.appendChild(line('Malipo Pro', BASE));
      picked.forEach(function (i) {
        var price = Number(i.dataset.price || 0);
        total += price;
        frag.appendChild(line(i.dataset.name, price));
      });

      rows.replaceChildren(frag);
      countEl.textContent = picked.length === 0
        ? T.soloPro
        : picked.length + (picked.length === 1 ? T.unAddon : T.variosAddons);

      var prev = Number(totalEl.dataset.value || total);
      totalEl.dataset.value = total;
      if (reduced || prev === total) {
        totalEl.textContent = money(total);
      } else {
        countUp(totalEl, prev, total);
      }
    }

    function countUp(el, from, to) {
      var t0 = null, dur = 420;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = money(from + (to - from) * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    root.addEventListener('change', render);
    render();
  })();

})();
