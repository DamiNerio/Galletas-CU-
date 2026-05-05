import { supabase } from './config.js';

export async function obtenerGalletas() {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) return console.error(error);
    renderizarGalletas(data);
}

function mostrarProductos(productos) {
    const contenedor = document.getElementById('contenedor-galletas');
    contenedor.innerHTML = '';

    productos.forEach(galleta => {
        // Verificamos si hay stock
        const hayStock = galleta.stock > 0;
        
        contenedor.innerHTML += `
            <div class="card">
                <img src="${galleta.imagen}" class="card-img-top">
                <div class="card-body">
                    <h5>${galleta.nombre}</h5>
                    <p>Stock disponible: ${galleta.stock}</p>
                    <p>$${galleta.precio}</p>
                    
                    <!-- Si no hay stock, desactivamos el botón y cambiamos el color -->
                    <button 
                        class="btn ${hayStock ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="${hayStock ? `agregarAlCarrito('${galleta.id}')` : ''}"
                        ${!hayStock ? 'disabled' : ''}>
                        ${hayStock ? '+ Agregar' : 'Agotado'}
                    </button>
                </div>
            </div>
        `;
    });
}