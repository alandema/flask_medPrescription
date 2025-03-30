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

function deletePatient () {
    const patientSelect = document.getElementById('patient-select');
    if(confirm('Tem certeza de que deseja excluir este paciente?')) {
        let objectId = patientSelect.value;        
    
        fetch(`/delete_patient/${objectId}`, {
            method: 'DELETE' // Make sure to specify the method
        })
            .then(response => response.json())
            .then(data => {
                patientSelect.remove(patientSelect.selectedIndex);
                document.getElementById('patientForm').reset();
                document.getElementById('patient_id').value = '';
                document.getElementById('deleteButton').hidden = true;
                patientSelect.value = 'new_patient';
            })
            .catch(error => console.log(error));
    }
}
document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const patientSelect = document.getElementById('patient-select');
    const countrySelect = document.getElementById('country');
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');
    const cepInput = document.getElementById('cep');
    const brazilFields = document.getElementById('brazil-fields');
    const patientForm = document.getElementById('patientForm');
    const deleteButton = document.getElementById('deleteButton');

    // Initialize form state
    resetForm();
    
    // Handle patient selection change
    patientSelect.addEventListener('change', async function () {
        const patientId = this.value;

        if (patientId === 'new_patient') {
            resetForm();
            return;
        }

        try {
            const response = await fetch(`/get_patient/${patientId}`);
            const patient = await response.json();

            // Populate the form with patient data
            document.getElementById('patient_id').value = patient.id;
            document.getElementById('name').value = patient.name;
            document.getElementById('gender').value = patient.gender;
            document.getElementById('cpf').value = patient.cpf;
            document.getElementById('birth_date').value = patient.birth_date;
            document.getElementById('phone').value = patient.phone;
            document.getElementById('cep').value = patient.zipcode;
            document.getElementById('country').value = patient.country;
            document.getElementById('street').value = patient.street;
            document.getElementById('house_number').value = patient.house_number;
            document.getElementById('district').value = patient.district;
            document.getElementById('additional_info').value = patient.additional_info;

            // Show/hide Brazil fields based on country
            updateBrazilFieldsVisibility(patient.country);
            
            // For Brazilian patients, we need to load states and cities
            if (patient.country === 'BR') {
                // First load all states
                await loadStates();
                stateSelect.value = patient.state;
                
                // Then load cities for the patient's state
                if (patient.state) {
                    await loadCities(patient.state);
                    citySelect.value = patient.city;
                }
                
                // Enable/disable state and city fields based on zipcode presence
                const hasValidZipcode = patient.zipcode && patient.zipcode.replace(/\D/g, '').length === 8;
                stateSelect.disabled = hasValidZipcode;
                citySelect.disabled = hasValidZipcode;
            }

            // Show the delete button
            deleteButton.hidden = false;
        } catch (error) {
            console.error('Error fetching patient data:', error);
            alert('Erro ao carregar dados do paciente');
        }
    });

    // Function to reset the form
    function resetForm() {
        patientForm.reset();
        document.getElementById('patient_id').value = '';
        patientSelect.value = 'new_patient';
        deleteButton.hidden = true;
        brazilFields.style.display = 'none';
        stateSelect.disabled = false;
        citySelect.disabled = false;
        
        // Reset state and city dropdowns
        stateSelect.innerHTML = '<option value="">Selecione o estado</option>';
        citySelect.innerHTML = '<option value="">Selecione a cidade</option>';
        
        // Set required attributes to default
        stateSelect.required = false;
        citySelect.required = false;
        cepInput.required = false;
    }

    // Handle country selection change
    countrySelect.addEventListener('change', function () {
        updateBrazilFieldsVisibility(this.value);
    });

    // Function to update Brazil fields visibility based on country selection
    function updateBrazilFieldsVisibility(country) {
        if (country === 'BR') {
            brazilFields.style.display = 'block';
            stateSelect.required = true;
            citySelect.required = true;
            
            // Load states if they haven't been loaded yet
            if (stateSelect.options.length <= 1) {
                loadStates();
            }
        } else {
            brazilFields.style.display = 'none';
            stateSelect.required = false;
            citySelect.required = false;
            cepInput.required = false;
        }
    }

    // Function to load states from IBGE API
    function loadStates() {
        return fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then(response => response.json())
            .then(states => {
                // Sort states alphabetically by name
                states.sort((a, b) => a.nome.localeCompare(b.nome));
                
                // Clear previous options but keep the default one
                stateSelect.innerHTML = '<option value="">Selecione o estado</option>';
                
                // Add each state as an option
                states.forEach(state => {
                    const option = document.createElement('option');
                    option.value = state.sigla; // e.g., 'SP'
                    option.textContent = state.nome; // e.g., 'São Paulo'
                    stateSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error loading states:', error);
                alert('Erro ao carregar estados');
            });
    }

    // Function to load cities for a given state from IBGE API
    function loadCities(state) {
        return fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`)
            .then(response => response.json())
            .then(cities => {
                // Sort cities alphabetically by name
                cities.sort((a, b) => a.nome.localeCompare(b.nome));
                
                // Clear previous options but keep the default one
                citySelect.innerHTML = '<option value="">Selecione a cidade</option>';
                
                // Add each city as an option
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.nome;
                    option.textContent = city.nome;
                    citySelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error loading cities:', error);
                alert('Erro ao carregar cidades');
            });
    }

    // Handle state selection to load cities
    stateSelect.addEventListener('change', function() {
        const selectedState = this.value;
        if (selectedState) {
            loadCities(selectedState);
        } else {
            // Clear the city dropdown if no state is selected
            citySelect.innerHTML = '<option value="">Selecione a cidade</option>';
        }
    });

    // Handle CEP input
    cepInput.addEventListener('input', async function () {
        const cep = this.value.replace(/\D/g, ''); // Remove non-digits
        
        // Format the CEP with hyphen
        if (cep.length > 5 && cep.length < 9) {
            this.value = `${cep.substring(0, 5)}-${cep.substring(5, 8)}`;
        } else {
            this.value = cep;
        }
        
        // Lookup address info when 8 digits are entered
        if (cep.length === 8) {


            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then(response => response.json())
                .then(data => {
                    if (data.erro) {
                        // Warn user if CEP is not found
                        alert('CEP não encontrado');
                        
                        // Enable manual state and city selection
                        stateSelect.disabled = false;
                        citySelect.disabled = false;
                        
                        // Make sure state and city are still required
                        stateSelect.required = true;
                        citySelect.required = true;
                        cepInput.required = false;
                    } else {
                        // Set state and load cities, then set city
                        loadStates().then(() => {
                            stateSelect.value = data.uf;
                            
                            loadCities(data.uf).then(() => {
                                citySelect.value = data.localidade;
                                
                                // Disable state and city fields since they were auto-populated
                                stateSelect.disabled = true;
                                citySelect.disabled = true;
                            });
                        });
                        
                        // Fill other address fields
                        document.getElementById('street').value = data.logradouro || '';
                        document.getElementById('district').value = data.bairro || '';
                        document.getElementById('additional_info').value = data.complemento || '';
                    }
                })
                .catch(error => {
                    console.error('Error fetching address by CEP:', error);
                    
                    // Enable manual state and city selection on error
                    stateSelect.disabled = false;
                    citySelect.disabled = false;
                });
        } else {
            // Enable manual state and city selection when CEP is not complete
            stateSelect.disabled = false;
            citySelect.disabled = false;
        }
    });
    
    // Form submission validation
    patientForm.addEventListener('submit', function(e) {
        // Validation checks can be added here
        // For example, checking required fields based on country
        const country = countrySelect.value;
        stateSelect.disabled = false;
        citySelect.disabled = false;
        if (country === 'BR') {
            // For Brazil, state and city are required
            if (!stateSelect.value) {
                e.preventDefault();
                alert('Por favor, selecione o estado');
                return;
            }
            
            if (!citySelect.value) {
                e.preventDefault();
                alert('Por favor, selecione a cidade');
                return;
            }
        }
    });
});