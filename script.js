document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.getElementById('spinner');
    const message = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Mostrar estado de carga
        submitBtn.disabled = true;
        spinner.classList.remove('hidden');
        message.classList.remove('show', 'success', 'error');
        
        // Obtener datos del formulario
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            comment: document.getElementById('comment').value,
            timestamp: new Date().toISOString()
        };

        try {
            // Reemplaza esta URL con tu webhook de Power Automate
            const response = await fetch('https://miwebhook.aqui', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                mostrarMensaje('¡Formulario enviado con éxito!', 'success');
                form.reset();
            } else {
                throw new Error('Error en el servidor');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Error al enviar el formulario. Por favor, inténtalo de nuevo.', 'error');
        } finally {
            // Restablecer estado del botón
            submitBtn.disabled = false;
            spinner.classList.add('hidden');
        }
    });

    function mostrarMensaje(texto, tipo) {
        message.textContent = texto;
        message.className = `message show ${tipo}`;
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            message.classList.remove('show');
        }, 5000);
    }

    // Funcionalidad de etiquetas flotantes
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        const label = group.querySelector('label');
        
        // Verificar si el campo tiene valor al cargar la página
        if (input.value) {
            label.classList.add('active');
        }
        
        input.addEventListener('focus', () => {
            label.classList.add('active');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                label.classList.remove('active');
            }
        });
    });
});
