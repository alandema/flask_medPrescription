document.addEventListener('DOMContentLoaded', function () {
    const cpfInput = document.getElementById('cpf');

    cpfInput.addEventListener('input', function (evt) {
        let value = evt.target.value.replace(/\D/g, ''); // Remove non-digits

        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }

        evt.target.value = value;
    });

    // Optional: Validate CPF before form submission
    document.getElementById('patientForm').addEventListener('submit', function (e) {
        const cpf = cpfInput.value.replace(/\D/g, '');
        if (!(function(cpf) {
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
        })(cpf)) {
            e.preventDefault();
            alert('Por favor, insira um CPF válido');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('keydown', function (evt) {
        if (evt.ctrlKey) {
            return;
        }
        if (evt.key.length > 1) {
            return;
        }
        if (/[0-9.]/.test(evt.key)) {
            return;
        }
        evt.preventDefault();
    });
    phoneInput.addEventListener('keyup', function (evt) {
        const digits = evt.target.value.replace(/\D/g,'');
      
        if(digits.length === 10) {
            evt.target.value = `(${digits.substring(0,2)}) ${digits.substring(2,6)}-${digits.substring(6,10)}`;
        }
        else if (digits.length === 11) {
            evt.target.value = `(${digits.substring(0,2)}) ${digits.substring(2,7)}-${digits.substring(7,11)}`;
        }
        else if(digits.length === 12) {
            evt.target.value = `+${digits.substring(0,1)} (${digits.substring(1,3)}) ${digits.substring(3,8)}-${digits.substring(8,12)}`;
        }
        else if(digits.length === 13) {
            evt.target.value = `+${digits.substring(0,2)} (${digits.substring(2,4)}) ${digits.substring(4,9)}-${digits.substring(9,13)}`;
        }
        else{
            evt.target.value = digits;
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const patientSelect = document.getElementById('patient-select');

    patientSelect.addEventListener('change', async function () {
        const patientId = this.value;

        if (patientId === 'new_patient') {
            document.getElementById('patientForm').reset();
            document.getElementById('patient_id').value = '';
            patientSelect.value = 'new_patient';
            document.getElementById('deleteButton').hidden = true;
            return;
        }

        const response = await fetch(`/get_patient/${patientId}`);
        const patient = await response.json();

        document.getElementById('patient_id').value = patient.id;
        document.getElementById('name').value = patient.name;
        document.getElementById('gender').value = patient.gender;
        document.getElementById('cpf').value = patient.cpf;
        document.getElementById('birth_date').value = patient.birth_date;
        document.getElementById('phone').value = patient.phone;
        document.getElementById('country').value = patient.country;
        document.getElementById('state').value = patient.state;
        document.getElementById('city').value = patient.city;
        document.getElementById('street').value = patient.street;
        document.getElementById('house_number').value = patient.house_number;
        document.getElementById('district').value = patient.district;
        document.getElementById('additional_info').value = patient.additional_info;

        if (patient.country === 'BR') {
            document.getElementById('state').hidden = false;
            document.getElementById('city').hidden = false;
            document.getElementById('cep').hidden = false;
        }

        document.getElementById('deleteButton').hidden = false;
    });

    const deleteButton = document.getElementById('deleteButton');
    deleteButton.addEventListener('click', function () {
        const patientSelect = document.getElementById('patient-select');
        if (confirm('Tem certeza de que deseja excluir este paciente?')) {
            let objectId = patientSelect.value;
            let objectName = patientSelect.options[patientSelect.selectedIndex].text;
    
            let data = {
                id: objectId,
                name: objectName
            };
    
            fetch('/delete_object', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    patientSelect.remove(patientSelect.selectedIndex);
                    document.getElementById('patientForm').reset();
                    document.getElementById('patient_id').value = '';
                    document.getElementById('deleteButton').hidden = true;
                    patientSelect.value = 'new_patient';
                })
                .catch(error => console.log(error));
        }
    });
});
document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const patientSelect = document.getElementById('patient');
    const countrySelect = document.getElementById('country');
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');
    const stateCityFields = document.getElementById('stateCityFields');
    const cepInput = document.getElementById('cep');
    const cepFieldContainer = document.getElementById('cep-field-container');

    // Function to load states from IBGE API
    function loadStates() {
        return fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
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
    }

    // Function to load cities for a given state from IBGE API
    function loadCities(state) {
        return fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`)
            .then(response => response.json())
            .then(cities => {
                cities.sort((a, b) => a.nome.localeCompare(b.nome));
                citySelect.innerHTML = '<option value="">Selecione a cidade</option>';
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.nome;
                    option.textContent = city.nome;
                    citySelect.appendChild(option);
                });
            });
    }

    // Function to set visibility of Brazil-specific fields
    function setVisibilityBasedOnCountry() {
        if (countrySelect.value === 'BR') {
            stateCityFields.style.display = 'block';
            stateSelect.required = true;
            citySelect.required = true;
            if (cepFieldContainer) cepFieldContainer.style.display = 'block';
        } else {
            stateCityFields.style.display = 'none';
            stateSelect.required = false;
            citySelect.required = false;
            if (cepFieldContainer) cepFieldContainer.style.display = 'none';
        }
    }

    // Handle patient selection change
    patientSelect.addEventListener('change', function () {
        if (this.value === 'new_option') {
            // Reset form for new patient
            countrySelect.value = '';
            stateSelect.value = '';
            citySelect.value = '';
            cepInput.value = '';
            setVisibilityBasedOnCountry(); // Hide fields since country is not 'BR'
        } else {
            // For existing patient, Flask reloads the page, so we rely on page load initialization
            // Trigger country change to ensure visibility matches the loaded data
            const event = new Event('change');
            countrySelect.dispatchEvent(event);
        }
    });

    // Handle country selection change
    countrySelect.addEventListener('change', function () {
        setVisibilityBasedOnCountry();
        if (this.value === 'BR') {
            const currentState = stateSelect.value;
            const currentCity = citySelect.value;
            loadStates().then(() => {
                stateSelect.value = currentState || '';
                if (currentState) {
                    loadCities(currentState).then(() => {
                        citySelect.value = currentCity || '';
                    });
                }
            });
        } else {
            stateSelect.value = '';
            citySelect.value = '';
            cepInput.value = '';
        }
    });

    // Load cities when state changes
    stateSelect.addEventListener('change', function () {
        const selectedState = this.value;
        if (selectedState) {
            loadCities(selectedState);
        } else {
            citySelect.innerHTML = '<option value="">Selecione a cidade</option>';
        }
    });

    // Handle CEP input
    cepInput.addEventListener('input', function () {
        const cep = this.value.replace(/\D/g, '');
        if (cep.length === 8) {
            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then(response => response.json())
                .then(data => {
                    if (data.erro) {
                        alert('CEP não encontrado');
                        stateSelect.value = '';
                        citySelect.innerHTML = '<option value="">Selecione a cidade</option>';
                    } else {
                        stateSelect.value = data.uf;
                        loadCities(data.uf).then(() => {
                            citySelect.value = data.localidade;
                        });
                        document.getElementById('street').value = data.logradouro || '';
                        document.getElementById('district').value = data.bairro || '';
                        document.getElementById('additional_info').value = data.complemento || '';
                    }
                });
        }
    });

    // Initialize form on page load
    setVisibilityBasedOnCountry();
    if (countrySelect.value === 'BR') {
        const currentState = stateSelect.value || '';
        const currentCity = citySelect.value || '';
        const currentCep = cepInput.value || '';
        loadStates().then(() => {
            stateSelect.value = currentState;
            if (currentState) {
                loadCities(currentState).then(() => {
                    citySelect.value = currentCity;
                });
            }
        });
        if (currentCep) cepInput.value = currentCep; // Ensure CEP is set
    }
});