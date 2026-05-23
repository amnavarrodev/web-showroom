/**
 * Script para generar páginas HTML de productos
 * Uso: node generar-productos.js
 * 
 * Genera archivos product-02.html hasta product-13.html
 * basados en la plantilla product-template.html
 */

const fs = require('fs');
const path = require('path');

// ========== CONFIGURACIÓN: EDITÁ SOLO ESTA SECCIÓN ==========

const productos = [
    {
        id: '02',
        nombre: 'Esmeralda',
        categoria: 'Piedras Preciosas',
        imagen: 'img/products/product-02.jpg',
        descripcion: 'Facilitamos la compra, venta e intermediación de esmeraldas de alta pureza. Trabajamos con productores y compradores verificados, garantizando calidad y origen certificado.',
        alt: 'Esmeralda de alta calidad'
    },
    {
        id: '03',
        nombre: 'Diamante',
        categoria: 'Piedras Preciosas',
        imagen: 'img/products/product-03.jpg',
        descripcion: 'Intermediamos en la adquisición de diamantes en bruto y tallados, conectando minas internacionales con joyerías e inversores privados. Transparencia y control en cada operación.',
        alt: 'Diamante en bruto y tallado'
    },
    {
        id: '04',
        nombre: 'Mina de Oro',
        categoria: 'Metales Preciosos',
        imagen: 'img/products/product-04.jpg',
        descripcion: 'Inversión en explotaciones auríferas. Gestionamos la compra, venta y asociación en minas de oro, con estudios de viabilidad y documentación asegurada. Oportunidades reales de inversión.',
        alt: 'Mina de oro en explotación'
    },
    {
        id: '05',
        nombre: 'Mina de Piedra Preciosa',
        categoria: 'Minería',
        imagen: 'img/products/product-05.jpg',
        descripcion: 'Acceda a oportunidades en minas de piedras preciosas. Somos intermediarios entre propietarios e inversores, verificando reservas comprobadas y situación legal de cada explotación.',
        alt: 'Mina de piedras preciosas'
    },
    {
        id: '06',
        nombre: 'Mina de Petróleo',
        categoria: 'Energía',
        imagen: 'img/products/product-06.jpg',
        descripcion: 'Intermediación en la adquisición y venta de yacimientos petrolíferos. Conectamos compradores y vendedores de minas de petróleo con total confidencialidad, estudios técnicos y rigor documental.',
        alt: 'Mina de petróleo'
    },
    {
        id: '07',
        nombre: 'Oleaginosas (Soja)',
        categoria: 'Agrocommodities',
        imagen: 'img/products/product-07.jpg',
        descripcion: 'Soja y derivados para exportación. Argentina es líder mundial en producción. Unimos productores locales con compradores de Asia, Europa y América, asegurando logística eficiente y contratos seguros.',
        alt: 'Soja argentina para exportación'
    },
    {
        id: '08',
        nombre: 'Maíz',
        categoria: 'Agrocommodities',
        imagen: 'img/products/product-08.jpg',
        descripcion: 'Comercialización internacional de maíz argentino de alta calidad. Gestionamos operaciones de gran escala con trazabilidad completa y cumplimiento de estándares sanitarios internacionales.',
        alt: 'Maíz argentino'
    },
    {
        id: '09',
        nombre: 'Girasol',
        categoria: 'Agrocommodities',
        imagen: 'img/products/product-09.jpg',
        descripcion: 'Aceite de girasol y subproductos de la industria oleaginosa. Conectamos a los productores argentinos con mercados globales, ofreciendo precios competitivos y entregas programadas.',
        alt: 'Girasol y aceite de girasol'
    },
    {
        id: '10',
        nombre: 'Derivados del Petróleo',
        categoria: 'Energía',
        imagen: 'img/products/product-10.jpg',
        descripcion: 'Crudo, gasolina, diésel, nafta, fuel oil y otros derivados. Operamos directamente con refinerías y distribuidores para abastecer el mercado interno argentino y la exportación regional.',
        alt: 'Derivados del petróleo'
    },
    {
        id: '11',
        nombre: 'Urea',
        categoria: 'Fertilizantes',
        imagen: 'img/products/product-11.jpg',
        descripcion: 'Fertilizante nitrogenado de grado agrícola esencial para la producción. Proveemos urea a productores y cooperativas argentinas, gestionando importación y distribución eficiente.',
        alt: 'Urea fertilizante'
    },
    {
        id: '12',
        nombre: 'Jet1',
        categoria: 'Combustibles',
        imagen: 'img/products/product-12.jpg',
        descripcion: 'Combustible de aviación Jet A-1 para aeronaves comerciales y privadas. Suministramos a aerolíneas y operadores con certificación de calidad internacional y continuidad de abastecimiento.',
        alt: 'Combustible Jet A-1'
    },
    {
        id: '13',
        nombre: 'Diésel',
        categoria: 'Combustibles',
        imagen: 'img/products/product-13.jpg',
        descripcion: 'Gasóleo de alto rendimiento para transporte, maquinaria agrícola e industrial. Intermediamos entre refinerías y grandes consumidores, asegurando precio competitivo y disponibilidad garantizada.',
        alt: 'Diésel para transporte e industria'
    }
];

// ========== PLANTILLA HTML ==========

function generarHTML(producto) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${producto.nombre} - Global Connect Argentina</title>
    <meta name="description" content="${producto.descripcion.substring(0, 150)}">
    <meta name="keywords" content="${producto.nombre.toLowerCase()}, ${producto.categoria.toLowerCase()}, intermediarios, commodities, Argentina, Global Connect">
    <meta name="author" content="Global Connect Argentina">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${producto.nombre} - Global Connect Argentina">
    <meta property="og:description" content="${producto.descripcion.substring(0, 150)}">
    <meta property="og:type" content="product">
    <meta property="og:locale" content="es_AR">
    
    <!-- Favicon -->
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌐</text></svg>">
    
    <!-- Hoja de estilos principal -->
    <link rel="stylesheet" href="css/style.css">
    
    <!-- Estilos específicos para la página de producto -->
    <style>
        .producto-detalle {
            padding: 120px 2rem 80px;
            background: var(--blanco);
        }
        .producto-detalle .container {
            max-width: 1100px;
        }
        .producto-wrapper {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            align-items: start;
        }
        .producto-imagen {
            width: 100%;
            max-height: 600px;
            object-fit: contain;
            border-radius: var(--borde-radius);
            box-shadow: var(--sombra);
            background: var(--gris-claro);
        }
        .producto-info {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .producto-info .categoria {
            color: var(--dorado);
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-size: 0.8rem;
        }
        .producto-info h1 {
            font-size: 2.2rem;
            font-weight: 700;
            color: var(--azul-oscuro);
            margin: 0;
            line-height: 1.2;
        }
        .producto-info .descripcion {
            font-size: 1.05rem;
            color: var(--texto-claro);
            line-height: 1.7;
        }
        .producto-info .btn-contacto-producto {
            display: inline-block;
            background: linear-gradient(135deg, var(--dorado), var(--dorado-claro));
            color: var(--azul-oscuro);
            padding: 14px 32px;
            border-radius: 50px;
            font-weight: 700;
            text-decoration: none;
            font-size: 1rem;
            transition: var(--transicion);
            margin-top: 15px;
            text-align: center;
            width: fit-content;
        }
        .producto-info .btn-contacto-producto:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(184, 134, 11, 0.4);
        }
        .producto-info .btn-volver {
            display: inline-block;
            background: transparent;
            color: var(--dorado);
            border: 1.5px solid var(--dorado);
            padding: 12px 28px;
            border-radius: 50px;
            font-weight: 600;
            text-decoration: none;
            font-size: 0.95rem;
            transition: var(--transicion);
            margin-top: 10px;
            width: fit-content;
        }
        .producto-info .btn-volver:hover {
            background: var(--dorado);
            color: var(--blanco);
        }

        @media (max-width: 768px) {
            .producto-wrapper {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            .producto-imagen {
                max-height: 400px;
            }
            .producto-info h1 {
                font-size: 1.7rem;
            }
            .producto-detalle {
                padding: 100px 1.2rem 60px;
            }
        }
    </style>
</head>
<body>

    <!-- ==================== NAVBAR ==================== -->
    <nav class="navbar" id="navbar">
        <div class="container">
            <a href="index.html" class="logo">
                <div class="icono">🌐</div>
                <div>
                    Global Connect
                    <span>ARGENTINA</span>
                </div>
            </a>
            <ul class="nav-links" id="navLinks">
                <li><a href="index.html#inicio">Inicio</a></li>
                <li><a href="index.html#servicios">Servicios</a></li>
                <li><a href="index.html#productos">Productos</a></li>
                <li><a href="index.html#contacto" class="btn-contacto-nav">Contacto</a></li>
            </ul>
            <button class="hamburger" id="hamburger" aria-label="Menú">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>

    <!-- ==================== DETALLE DEL PRODUCTO ==================== -->
    <section class="producto-detalle">
        <div class="container">
            <div class="producto-wrapper">
                <img src="${producto.imagen}" 
                     alt="${producto.alt}" 
                     class="producto-imagen" 
                     loading="lazy"
                     width="810"
                     height="1440">
                
                <div class="producto-info">
                    <span class="categoria">${producto.categoria}</span>
                    <h1>${producto.nombre}</h1>
                    <p class="descripcion">${producto.descripcion}</p>
                    <a href="index.html#contacto" class="btn-contacto-producto">Consultar por este producto</a>
                    <a href="index.html#productos" class="btn-volver">← Volver a Productos</a>
                </div>
            </div>
        </div>
    </section>

    <!-- ==================== FOOTER ==================== -->
    <footer>
        <div class="container">
            <p>&copy; 2026 <a href="index.html">Global Connect Argentina</a>. Todos los derechos reservados. | Buenos Aires, Argentina.</p>
        </div>
    </footer>

    <script src="js/script.js"></script>
</body>
</html>`;
}

// ========== GENERAR ARCHIVOS ==========

console.log('🚀 Generando páginas de productos...\n');

let generados = 0;

productos.forEach(producto => {
    const nombreArchivo = `product-${producto.id}.html`;
    const rutaArchivo = path.join(__dirname, nombreArchivo);
    
    try {
        fs.writeFileSync(rutaArchivo, generarHTML(producto), 'utf8');
        console.log(`✅ Creado: ${nombreArchivo} → ${producto.nombre}`);
        generados++;
    } catch (error) {
        console.error(`❌ Error al crear ${nombreArchivo}: ${error.message}`);
    }
});

console.log(`\n📊 Total de archivos generados: ${generados}/12`);
console.log('🎉 ¡Proceso completado!\n');
console.log('📝 Podés editar las descripciones en el array "productos" del script y volver a ejecutarlo.');