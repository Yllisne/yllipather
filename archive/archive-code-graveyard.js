            //old build table row
            
            /*const buildRow = () =>{
                const tr = document.createElement('tr');
            }

            //papnames
            const tdName = document.createElement('td');
            tdName.textContent = pap;
            tr.appendChild(tdName);

            //checkbox
            const tdCheckbox = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            tdCheckbox.appendChild(checkbox);
            tr.appendChild(tdCheckbox);

            //select method
            const tdSelectMethod = document.createElement('td');
            const selectMethod = document.createElement('select');

            for (const key in method_map) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = key;
                selectMethod.appendChild(option);

                let keywords = method_map[key];
                if (!Array.isArray(keywords)) {
                    keywords = [keywords];
                }
                const papLower = pap.toLowerCase();
                const found = keywords.some(keywords => papLower.includes(keywords.toLowerCase()));

                if (found) {
                    option.selected = true; // Select the option if keywords match
                }
            }
            tdSelectMethod.appendChild(selectMethod)
            tr.appendChild(tdSelectMethod);

            //select emote
            const tdSelectEmote = document.createElement('td');
            const selectEmote = document.createElement('select');
            selectEmote.innerHTML = ''; // Clear existing options
            const assignedFileName = findAssignedPapNames(jsonObjects, pap);
            let assignedfound = '';
            for (const assigned of assignedFileName) {
                if (assigned.assignedValue.includes(pap)) {
                    assignedfound = assigned.pathKey;
                    //console.log(`Found assigned pap name: ${assigned.pathKey} for ${pap}`);
                    break; // Stop after finding the first match
                }
            }
            for (const key in emote_map) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = emote_map[key][0];
                selectEmote.appendChild(option);

                let keywords = [normalizePath(key)];
                if (!Array.isArray(keywords)) {
                    keywords = [keywords];
                }



                const found = assignedfound && keywords.some(keyword =>
                    normalizePath(assignedfound.toLowerCase()).includes(keyword.toLowerCase()));
                if (found) {
                    option.selected = true; // Select the option if keywords match
                }
                else {
                    const found = keywords.some(keyword =>
                        normalizePath(pap.toLowerCase()).includes(keyword.toLowerCase()));
                    if (found) {
                        option.selected = true; // Select the option if keywords match
                    }
                    else {
                        const newOption = document.createElement('option');
                        newOption.value = assignedFileName;
                    }
                }

            }
            tdSelectEmote.appendChild(selectEmote);
            tr.appendChild(tdSelectEmote);

            //delete button
            const tdButton = document.createElement('td');
            const delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.className = 'smolbutton'; // Add a class for styling
            delBtn.addEventListener('click', () => {
                tr.remove(); // Remove the row
            });
            tdButton.appendChild(delBtn);
            tr.appendChild(tdButton);*/

            //tbody.appendChild(tr);

            //const assignedGroups = findAssignedGroup(jsonObjects, pap);