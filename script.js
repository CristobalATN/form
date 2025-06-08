document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const form = document.getElementById('obraForm');
    const formatoSelect = document.getElementById('formato');
    const episodiosSection = document.getElementById('episodiosSection');
    const bloquesEpisodios = document.getElementById('bloquesEpisodios');
    const agregarBloqueBtn = document.getElementById('agregarBloque');
    const mensajeDiv = document.getElementById('mensaje');
    
    // Webhook URL - ¡Reemplaza con tu URL de webhook de Power Automate!
    const WEBHOOK_URL = 'https://your-power-automate-webhook-url-here.com';
    
    // Contador para bloques de episodios
    let contadorBloques = 0;
    
    // Mostrar/ocultar sección de episodios según el formato seleccionado
    formatoSelect.addEventListener('change', function() {
        if (this.value === 'Serie') {
            episodiosSection.style.display = 'block';
            // Agregar un bloque por defecto cuando se selecciona Serie
            if (contadorBloques === 0) {
                agregarBloqueEpisodio();
            }
        } else {
            episodiosSection.style.display = 'none';
            // Limpiar bloques existentes
            bloquesEpisodios.innerHTML = '';
            contadorBloques = 0;
        }
    });
    
    // Agregar un nuevo bloque de episodios
    agregarBloqueBtn.addEventListener('click', agregarBloqueEpisodio);
    
    // Función para agregar un bloque de episodios
    function agregarBloqueEpisodio() {
        contadorBloques++;
        const bloqueId = `bloque-${contadorBloques}`;
        
        const bloqueHTML = `
            <div class="episodio-bloque" id="${bloqueId}">
                <h3>Bloque de Episodios #${contadorBloques}</h3>
                <button type="button" class="eliminar-bloque" data-bloque="${bloqueId}">Eliminar</button>
                <div class="form-group">
                    <label for="cantidad-${contadorBloques}">Cantidad de episodios *</label>
                    <input type="number" id="cantidad-${contadorBloques}" min="1" required>
                </div>
                <div class="form-group">
                    <label for="temporada-${contadorBloques}">Temporada *</label>
                    <input type="text" id="temporada-${contadorBloques}" required>
                </div>
                <div class="form-group">
                    <label for="directores-${contadorBloques}">Directores *</label>
                    <input type="text" id="directores-${contadorBloques}" required>
                </div>
                <div class="form-group">
                    <label for="guionistas-${contadorBloques}">Guionistas *</label>
                    <input type="text" id="guionistas-${contadorBloques}" required>
                </div>
            </div>
        `;
        
        // Agregar el bloque al contenedor
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = bloqueHTML;
        const nuevoBloque = tempDiv.firstElementChild;
        bloquesEpisodios.appendChild(nuevoBloque);
        
        // Agregar evento al botón de eliminar
        nuevoBloque.querySelector('.eliminar-bloque').addEventListener('click', function() {
            if (confirm('¿Estás seguro de que deseas eliminar este bloque de episodios?')) {
                this.closest('.episodio-bloque').remove();
                contadorBloques--;
                actualizarNumerosBloques();
            }
        });
    }
    
    // Función para actualizar los números de los bloques
    function actualizarNumerosBloques() {
        const bloques = document.querySelectorAll('.episodio-bloque');
        bloques.forEach((bloque, index) => {
            const titulo = bloque.querySelector('h3');
            if (titulo) {
                titulo.textContent = `Bloque de Episodios #${index + 1}`;
            }
        });
    }
    
    // Manejar el envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar el formulario
        if (!form.checkValidity()) {
            mostrarMensaje('Por favor, completa todos los campos requeridos.', 'error');
            return;
        }
        
        // Obtener datos generales
        const datosGenerales = {
            tipo_obra: document.getElementById('tipoObra').value,
            titulo_original: document.getElementById('titulo').value,
            idioma: document.getElementById('idioma').value,
            año: document.getElementById('anio').value,
            formato: formatoSelect.value
        };
        
        // Preparar el arreglo de datos a enviar
        const datosAEnviar = [];
        
        if (formatoSelect.value === 'Serie') {
            // Procesar bloques de episodios
            const bloques = document.querySelectorAll('.episodio-bloque');
            if (bloques.length === 0) {
                mostrarMensaje('Debes agregar al menos un bloque de episodios.', 'error');
                return;
            }
            
            let esPrimerBloque = true;
            
            bloques.forEach((bloque, index) => {
                const bloqueId = bloque.id.split('-')[1]; // Ej: 'bloque-3' → '3'
                const cantidad = parseInt(document.getElementById(`cantidad-${bloqueId}`).value);
                const temporada = document.getElementById(`temporada-${bloqueId}`).value;
                const directores = document.getElementById(`directores-${bloqueId}`).value;
                const guionistas = document.getElementById(`guionistas-${bloqueId}`).value;

                
                // Crear un objeto para cada episodio en el bloque
                for (let i = 0; i < cantidad; i++) {
                    const objetoEpisodio = {
                        tipo_obra: esPrimerBloque ? datosGenerales.tipo_obra : "",
                        titulo_original: esPrimerBloque ? datosGenerales.titulo_original : "",
                        idioma: esPrimerBloque ? datosGenerales.idioma : "",
                        año: esPrimerBloque ? datosGenerales.año : "",
                        formato: esPrimerBloque ? datosGenerales.formato : "",
                        temporada: temporada,
                        directores: directores,
                        guionistas: guionistas
                    };
                    
                    datosAEnviar.push(objetoEpisodio);
                    esPrimerBloque = false;
                }
            });
        } else {
            // Para película, solo enviar los datos generales
            datosAEnviar.push(datosGenerales);
        }
        
        try {
            // Mostrar mensaje de envío
            mostrarMensaje('Enviando datos, por favor espera...', 'info');
            
            // Enviar datos al webhook
            const respuesta = await fetch("https://default0c13096209bc40fc8db89d043ff625.1a.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0c8c228f38c5490d83c92a103ae5d92d/triggers/manual/paths/invoke/?api-version=1&tenantId=tId&environmentName=Default-0c130962-09bc-40fc-8db8-9d043ff6251a&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=nx4oKSAhHDVAMja4AmD5frYdqH0OsrritLBG1Y-Twkg", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosAEnviar)
            });
            
            if (respuesta.ok) {
                mostrarMensaje('¡Declaración enviada con éxito!', 'exito');
                // Reiniciar el formulario
                form.reset();
                bloquesEpisodios.innerHTML = '';
                contadorBloques = 0;
                episodiosSection.style.display = 'none';
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error al enviar los datos:', error);
            mostrarMensaje('Error al enviar la declaración. Por favor, inténtalo de nuevo más tarde.', 'error');
        }
    });
    
    // Función para mostrar mensajes al usuario
    function mostrarMensaje(mensaje, tipo) {
        mensajeDiv.textContent = mensaje;
        mensajeDiv.className = 'mensaje';
        mensajeDiv.classList.add(tipo);
        
        // Ocultar mensaje después de 5 segundos (excepto para errores)
        if (tipo !== 'error') {
            setTimeout(() => {
                mensajeDiv.style.opacity = '0';
                setTimeout(() => {
                    mensajeDiv.className = 'mensaje';
                    mensajeDiv.style.opacity = '';
                }, 500);
            }, 5000);
        }
    }
    
    // Validación en tiempo real
    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.classList.remove('invalid');
            } else {
                this.classList.add('invalid');
            }
        });
    });
});
