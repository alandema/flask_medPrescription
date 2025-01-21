document.addEventListener('DOMContentLoaded', function () {
    const cpfInput = document.getElementById('cpf');

    cpfInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }

        e.target.value = value;
    });

    // Optional: Validate CPF before form submission
    document.querySelector('.patient-form').addEventListener('submit', function (e) {
        const cpf = cpfInput.value.replace(/\D/g, '');
        if (!isValidCPF(cpf)) {
            e.preventDefault();
            alert('Por favor, insira um CPF válido');
        }
    });
});


function formatPhone(mascara, documento) {
    let i = documento.value.length;
    let saida = '#';
    let texto = mascara.substring(i);
    while (texto.substring(0, 1) != saida && texto.length) {
        documento.value += texto.substring(0, 1);
        i++;
        texto = mascara.substring(i);
    }
}

// CPF validation function
function isValidCPF(cpf) {
    if (cpf.length !== 11) return false;

    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validate first digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    // Validate second digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;

    return true;
}

document.addEventListener('DOMContentLoaded', function () {
    const countrySelect = document.getElementById('country');
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');
    const stateCityFields = document.getElementById('stateCityFields');

    // Handle country selection
    countrySelect.addEventListener('change', function () {
        if (this.value === 'BR') {
            stateCityFields.style.display = 'block';
            stateSelect.required = true;
            citySelect.required = true;

            // Load states
            fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
                .then(response => response.json())
                .then(states => {
                    states.sort((a, b) => a.nome.localeCompare(b.nome));
                    stateSelect.innerHTML = '<option value="">Selecione o estado</option>';
                    states.forEach(state => {
                        const option = document.createElement('option');
                        option.value = state.sigla;
                        option.textContent = state.nome;
                        stateSelect.appendChild(option);
                    });
                });
        } else {
            // If "Outro" is selected
            stateCityFields.style.display = 'none';
            stateSelect.required = false;
            citySelect.required = false;
            stateSelect.value = '';
            citySelect.value = '';
        }
    });

    // Load cities when state changes
    stateSelect.addEventListener('change', function () {
        const selectedState = this.value;
        citySelect.innerHTML = '<option value="">Selecione a cidade</option>';

        if (selectedState) {
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`)
                .then(response => response.json())
                .then(cities => {
                    cities.sort((a, b) => a.nome.localeCompare(b.nome));
                    cities.forEach(city => {
                        const option = document.createElement('option');
                        option.value = city.nome;
                        option.textContent = city.nome;
                        citySelect.appendChild(option);
                    });
                });
        }
    });

    // Trigger country change event on page load to set initial state
    const event = new Event('change');
    countrySelect.dispatchEvent(event);
});

document.addEventListener('DOMContentLoaded', function () {
    const patientSelect = document.getElementById('patient-select');



    patientSelect.addEventListener('change', function () {
        const patientId = this.value;

        if (patientId === 'new') {
            // Clear the form for new patient
            document.getElementById('patientForm').reset();
            patientSelect.value = 'new';
            return;
        }
        fetch(`/get_patient/${patientId}`)
            .then(response => response.json())
            .then(patient => {
                document.getElementById('name').value = patient.name;
                document.getElementById('cpf').value = patient.cpf;
                document.getElementById('birth_date').value = patient.birth_date;
                document.getElementById('phone').value = patient.phone;
                document.getElementById('country').value = patient.country;
                document.getElementById('state').value = patient.state;
                document.getElementById('city').value = patient.city;
                document.getElementById('street').value = patient.street;
                document.getElementById('house_number').value = patient.house_number;
                document.getElementById('additional_info').value = patient.additional_info;
            })
    });
});

