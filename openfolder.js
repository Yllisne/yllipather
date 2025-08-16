// FUNCTIONS
let meta_exists = false;
let default_mod_exists = false;
let group_json_existing = 0;
async function readFolderRecursive(dirHandle, path = '', namesArray = [], contentArray = []) {
    // page visual adjustments
    document.getElementById('intro').style.display = 'none';
    //document.getElementById('btnfolder').textContent = 'Replace folder';
    document.getElementById('btnfolder').style.display = 'none';
    document.getElementById('btnjsn').style.display = 'block';
    jsonObjects = [];
    //open files in the folder
    for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind === 'file') {
            let filePath = `${path}${name}`;
            namesArray.push(`${path}${name}`);
            const file = await handle.getFile();
            const text = await file.text();
            if (name.endsWith('.json')) {
                if (name === 'meta.json') {
                    meta_exists = true;
                }
                else if (name === 'default_mod.json') {
                    default_mod_exists = true;
                } else if (/^group_\d+_.+\.json$/i.test(name)) {
                    group_json_existing++;
                }

                try {
                    const jsonData = JSON.parse(text);
                    jsonObjects.push({ filePath, jsonData }); //it will persist until you clear or overwrite the array
                } catch (error) {
                    showError(`Error parsing JSON from ${name}: ${error.message}`)
                }
            }
            contentArray.push(`--- ${path}${name} ---\n${text}\n\n`);
        } else if (handle.kind === 'directory') {
            await readFolderRecursive(handle, `${path}${name}/`, namesArray, contentArray);
        }
    }

}

function findAssignedPapNames(jsonObjects) {
    const assignedPapData = [];
    for (const { jsonData } of jsonObjects) {
        if (!jsonData.Options || !Array.isArray(jsonData.Options)) continue;
        for (const option of jsonData.Options) {
            if (!option.Files) continue;

            for (const [pathKey, assignedValue] of Object.entries(option.Files)) {

                assignedPapData.push({ pathKey, assignedValue });
            }
        }
    }

    return assignedPapData;
}

function findAssignedGroup(jsonObjects, papName, tableOfContent) {
    const groups = [];
    for (const { jsonData } of jsonObjects) {
        if (!jsonData.Options || !Array.isArray(jsonData.Options)) continue;

        const topLevelName = Array.isArray(jsonData)
            ? jsonData[0]?.Name
            : jsonData.Name || "Unnamed Group";
        for (const option of jsonData.Options) {
            if (!option.Files) continue;

            for (const [pathKey, assignedValue] of Object.entries(option.Files)) {
                const values = Array.isArray(assignedValue) ? assignedValue : [assignedValue];
                if (values.some(val => normalizePath(val).includes(normalizePath(papName)))) {
                    groups.push(topLevelName);

                    const tocItem = tableOfContent.find(item => item.sname === papName);
                    if (tocItem) {
                        tocItem.grpid = topLevelName;
                        tocItem.assignedGamePath = pathKey;
                    }

                }
            }
        }
    }
    return groups;
}

function findAssignedOption(jsonObjects, papName, tableOfContent) {
    const options = [];

    for (const { jsonData } of jsonObjects) {
        if (!jsonData.Options || !Array.isArray(jsonData.Options)) continue;

        for (const option of jsonData.Options) {
            if (!option.Files) continue;

            for (const [pathKey, assignedValue] of Object.entries(option.Files)) {
                const values = Array.isArray(assignedValue) ? assignedValue : [assignedValue];

                if (values.some(val => normalizePath(val).includes(normalizePath(papName)))) {
                    options.push(option.Name);

                    // update your table of contents if relevant
                    const tocItem = tableOfContent.find(item => item.sname === papName);
                    if (tocItem) {
                        tocItem.optit = option.Name;           // save which option
                        tocItem.assignedOptionPath = pathKey;  // save which path
                    }
                }
            }
        }
    }

    return options.length > 0 ? options : null;
}



function normalizePath(path) {
    path = String(path); // Ensure path is a string
    return path.replace(/c\d{4}/, 'c0101');
}

function drag(event) {
    const tr = event.target.closest('tr'); // ensures you always get the row
    event.dataTransfer.setData("text/plain", tr.dataset.id);
}

function allowDrop(event) {
    event.preventDefault();
}

const optionTableMap = {};
const groupTableMap = {}; // Store tables for each group
function drop(event) {
    event.preventDefault();

    const id = event.dataTransfer.getData("text/plain");
    const draggedRow = document.querySelector(`[data-id="${id}"]`);
    if (!draggedRow) return;

    const targetTbody = event.currentTarget;
    targetTbody.appendChild(draggedRow);

    // --- UPDATE tableOfContent ---
    //const papName = draggedRow.querySelector("td").textContent; // assuming first td has the pap name
    const papName = draggedRow.querySelector("td").textContent.trim();

    const tocItem = tableOfContent.find(item => item.sname === papName);
    if (!tocItem) return;

    // check if it's dropped into an option table or a group table
    const optionEntry = Object.entries(optionTableMap).find(([optionName, tbody]) => tbody === targetTbody);
    const groupEntry = Object.entries(groupTableMap).find(([groupName, tbody]) => tbody === targetTbody);

    if (optionEntry) {
        tocItem.optit = optionEntry[0];            // update assigned option
        tocItem.assignedOptionPath = '';           // optionally keep path if needed
        tocItem.grpid = '';                        // clear group if moved to an option
    } else if (groupEntry) {
        tocItem.grpid = groupEntry[0];             // update assigned group
        tocItem.optit = null;                      // clear option if dropped in group directly
        tocItem.assignedOptionPath = '';
        tocItem.optit = optionEntry[0];
        tocItem.assignedOptionPath = '';
        tocItem.grpid = '';
    } else {
        // if dropped in unassigned table
        tocItem.grpid = '';
        tocItem.optit = null;
        tocItem.assignedOptionPath = '';
    }
}

function createPlaceholderRow() {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    //const columnCount = table.querySelector("thead tr")?.children.length || 1;
    td.colSpan = 5;
    td.className = 'tddrop';
    td.style.textAlign = 'center';
    td.textContent = "Drop file(s) here"
    tr.appendChild(td);
    return tr;
}

function showError(msg) {
    const errorel = document.getElementById('btnfolder_errmsg')
    errorel.style.display = 'block';
    errorel.textContent = msg;
    console.error(msg)
}

function createIconButton(iconSrc, altText, onClick) {
    const btn = document.createElement('button');
    btn.className = 'smolbutton';
    const icon = document.createElement('img');
    icon.src = iconSrc;
    icon.alt = altText;
    icon.style.width = '16px';
    icon.style.height = '16px';
    btn.appendChild(icon);
    if (onClick) btn.addEventListener('click', onClick);
    return btn;
}

// 'GLOBAL' VARIABLES
let jsonnames = []; // both .json and .pap names, not array
let papnames = []; //only names of .paps, array
let jsonnamesonly = []; // only names of .json, array
let jsoncontent = []; // jsons content as text
let tableOfContent = [];

document.getElementById('btnfolder').addEventListener('click', async function () {
    try {
        const folderPath = await window.showDirectoryPicker();
        document.getElementById('btnfolder_errmsg').style.display = 'none';

        // json names with funcion and jsoncontent with for (wasn't working with function)
        await readFolderRecursive(folderPath, '', jsonnames);
        for await (const [name, handle] of folderPath.entries()) {
            if (handle.kind === 'file') {
                const file = await handle.getFile();
                const text = await file.text();
                jsoncontent.push(`--- ${name} ---\n${text}\n\n`);
            }
        }
        // make seperate arrays for json and pap names
        jsonnamesonly = jsonnames.filter(name => name.endsWith('.json'));
        papnames = jsonnames.filter(name => name.endsWith('.pap'));

        // strip paps from folders
        papnames = papnames.map((name, index) => {
            const parts = name.split('/');
            const shortname = parts[parts.length - 1];

            tableOfContent.push({
                id: index + 1,
                fullname: name,
                sname: shortname,
                assignedGamePath: '',
                grpid: '',
            })
            return shortname;

        });

        //actually showing the json content on the page
        document.getElementById('jsonnames').textContent = jsonnames.join('\n');
        document.getElementById('jsoncontent').textContent = jsoncontent;
        //console.log(jsonObjects);

        //mod author header
        jsonObjects.forEach(({ jsonData, filePath }) => {
            if (filePath.endsWith('meta.json')) {
                const modName = jsonData.Name || 'Unknown Mod';
                const author = jsonData.Author || 'Unknown Author';
                const website = jsonData.Website || '#';

                const modlink = document.getElementById('modlink');
                const modinfo = document.getElementById('modinfo');
                if (modName !== 'Unknown Mod') {
                    document.getElementById('modinfo').style.display = "block";
                    document.getElementById('pmodinfo').style.display = "block";

                } else {
                    document.getElementById('unk_modinfo').style.display = "block";
                }

                // Set the link URL and visible text
                modlink.href = website;
                modinfo.textContent = `${author} – ${modName}`;

            }
        });


    }
    catch (error) {
        showError(error);
    }


    //list of groups
    document.getElementById('groups').style.display = 'block';
    document.getElementById('groups').style.display = 'block';
    let id = 0;
    const groupMap = {};




    jsonnamesonly.forEach((filename, index) => {
        if (['default_mod.json', 'meta.json'].includes(filename)) {
            return; // skip this iteration
        }

        id++;
        // Find the corresponding json object
        const jsonObj = jsonObjects.find(o => o.filePath.endsWith(filename));
        const groupName = Array.isArray(jsonObj.jsonData)
            ? jsonObj.jsonData.find(item => item?.Name)?.Name || `Group ${id}`
            : jsonObj.jsonData.Name || `Group ${id}`;

        // Create the main drag-box div
        const dragBox = document.createElement('div');
        dragBox.className = 'drag-box';

        // Create the header div
        const header = document.createElement('div');
        header.className = 'drag-box-header';

        // Create the group name span
        const groupData = Array.isArray(jsonObj.jsonData)
            ? jsonObj.jsonData.find(item => item?.Name)
            : jsonObj.jsonData;

        inputtextName = document.createElement('input');
        inputtextName.type = 'text';
        inputtextName.id = `grp${id}`;
        inputtextName.value = groupData?.Name || `Group ${id}`;

        if (!groupMap[groupData?.Name || `Group ${id}`]) {
            groupMap[groupData?.Name || `Group ${id}`] = {
                id: `grp${id}`,
                name: groupData?.Name || `Group ${id}`,
                jsonData: jsonObj.jsonData, //store json data for this group
            }
        }

        // Create the select element
        const spanSelect = document.createElement('span');
        const select = document.createElement('select');
        select.style.cssText = 'border-radius:6px;padding:2px 8px;font-size:0.98em;';
        select.innerHTML = `
        <option>Single</option>
        <option>Multi</option>
    `;
        const selectData = Array.isArray(jsonObj.jsonData)
            ? jsonObj.jsonData.find(item => item?.Type)
            : jsonObj.jsonData;

        select.value = selectData?.Type || 'Single'; // Set the value based on jsonData
        spanSelect.appendChild(select);

        // Append fields to header
        header.appendChild(inputtextName);
        header.appendChild(spanSelect);

        // Create drag-box-space div
        const dragSpace = document.createElement('div');


        jsonObj.jsonData.Options.forEach(option => {
            const optionBox = document.createElement('div');
            optionBox.className = 'option-box';

            const optionHeader = document.createElement('div');
            optionHeader.className = 'option-header';
            optionHeader.textContent = option.Name;

            const optionTable = document.createElement('table');
            const optionTbody = document.createElement('tbody');
            optionTable.appendChild(optionTbody);
            optionTbody.addEventListener('dragover', allowDrop);
            optionTbody.addEventListener('drop', drop);

            optionTbody.appendChild(createPlaceholderRow());


            optionBox.appendChild(optionHeader);
            optionBox.appendChild(optionTable);
            dragSpace.appendChild(optionBox);

            optionTableMap[option.Name] = optionTbody;

        })


        const table = document.createElement('table');
        table.id = `table${groupName.replace(/\s+/g, '_')}`;

        const tbody = document.createElement('tbody');
        document.getElementById('defaultTable').addEventListener("dragover", allowDrop);
        document.getElementById('defaultTable').addEventListener("drop", drop);
        document.getElementById('unassignedTable').addEventListener("dragover", allowDrop);
        document.getElementById('unassignedTable').addEventListener("drop", drop);
        tbody.addEventListener("dragover", allowDrop);
        tbody.addEventListener("drop", drop);


        table.style.minHeight = '40px'; // make empty tables visible

        //placeholders for empty group
        tbody.appendChild(createPlaceholderRow());



        table.appendChild(tbody);
        dragSpace.appendChild(table);

        groupTableMap[groupName] = tbody; // Store the table for this group

        // Append header and drag space to main box
        dragBox.appendChild(header);
        dragBox.appendChild(dragSpace);

        // Append drag-box to groups container
        document.getElementById('groups').appendChild(dragBox);
    });

    if (id === 0) {
        console.warn('No groups found in jsonnamesonly');
    }

    let trid = 0;
    //building the pap table visible on website
    if (document.getElementById('unassignedTable').style.display === 'none') {
        document.getElementById('unassignedTable').style.display = 'table';
    }
    if (papnames.length > 0) {

        const tbody = document.querySelector('#unassignedTable tbody');
        if (!tbody.querySelector('.tddrop') && tbody === document.querySelector('#unassignedTable tbody')) {
            tbody.appendChild(createPlaceholderRow());
        }

        papnames.forEach(pap => {
            const assignedGroups = [...new Set(findAssignedGroup(jsonObjects, pap, tableOfContent))]; // remove duplicates
            const assignedOptionGroups = [...new Set(findAssignedOption(jsonObjects, pap, tableOfContent))]
            const buildRow = (pap) => {
                const tr = document.createElement('tr');
                tr.draggable = "true";
                tr.id = trid;
                trid++;
                tr.addEventListener("dragstart", drag);

                // Name
                const tdName = document.createElement('td');
                tdName.textContent = pap;
                tr.appendChild(tdName);

                // Checkbox
                const tdCheckbox = document.createElement('td');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                tdCheckbox.appendChild(checkbox);
                tr.appendChild(tdCheckbox);

                // Method select
                const tdSelectMethod = document.createElement('td');
                const selectMethod = document.createElement('select');
                for (const key in method_map) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = key;

                    const keywords = Array.isArray(method_map[key]) ? method_map[key] : [method_map[key]];
                    if (keywords.some(k => pap.toLowerCase().includes(k.toLowerCase()))) option.selected = true;

                    selectMethod.appendChild(option);
                }
                tdSelectMethod.appendChild(selectMethod);
                tr.appendChild(tdSelectMethod);

                // Emote select
                const tdSelectEmote = document.createElement('td');
                const selectEmote = document.createElement('select');

                const assignedFileName = findAssignedPapNames(jsonObjects);
                let assignedfound = '';
                for (const assigned of assignedFileName) {
                    if (assigned.assignedValue.includes(pap)) {
                        assignedfound = assigned.pathKey;
                        break;
                    }
                }

                for (const key in emote_map) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = emote_map[key][0];

                    const keyword = normalizePath(key);
                    if (assignedfound && normalizePath(assignedfound.toLowerCase()).includes(keyword.toLowerCase())) {
                        option.selected = true;
                    } else if (normalizePath(pap.toLowerCase()).includes(keyword.toLowerCase())) {
                        option.selected = true;
                    }

                    selectEmote.appendChild(option);
                }

                tdSelectEmote.appendChild(selectEmote);
                tr.appendChild(tdSelectEmote);

                const tdButton = document.createElement('td');
                const delBtn = document.createElement('button');

                // edit button

                const editButton = document.createElement('button');
                editButton.className = 'smolbutton';
                const editIcon = document.createElement('img');
                editIcon.src = 'img/edit_icon.png'; // Path to your edit icon
                editIcon.alt = 'Edit';
                editIcon.style.width = '16px';
                editIcon.style.height = '16px';
                editButton.appendChild(editIcon);
                tdButton.appendChild(editButton);
                tr.appendChild(tdButton);

                // Clone button

                const cloneButton = document.createElement('button');
                cloneButton.className = 'smolbutton';
                const icon = document.createElement('img');
                icon.src = 'img/clone_icon.png'; // Path to your clone icon
                icon.alt = 'Clone';
                icon.style.width = '16px';
                icon.style.height = '16px';
                cloneButton.appendChild(icon);

                cloneButton.addEventListener('click', () => {
                    const clone = tr.cloneNode(true);
                    clone.dataset.id = ++trid; // give it a unique id
                    clone.addEventListener("dragstart", drag); // reattach drag listener
                    tdButton.parentElement.appendChild(clone); // append to the same tbody
                });

                tdButton.appendChild(cloneButton);
                tr.appendChild(tdButton);

                // Delete button

                delBtn.className = 'smolbutton';
                const delIcon = document.createElement('img');
                delIcon.src = 'img/delete_icon.png'; // Path to your delete icon
                delIcon.alt = 'Delete';
                delIcon.style.width = '16px';
                delIcon.style.height = '16px';
                delBtn.appendChild(delIcon);
                delBtn.addEventListener('click', () => tr.remove());
                tdButton.appendChild(delBtn);
                tr.appendChild(tdButton);


                tr.draggable = "true";
                tr.addEventListener("dragstart", drag)
                tr.dataset.id = trid;

                return tr;
            };
            //console.log(tableOfContent)

            const assignedOptions = assignedOptionGroups;

            if (assignedGroups.length > 0) {
                assignedGroups.forEach(group => {
                    const groupTbody = groupTableMap[group];
                    if (!groupTbody) {
                        console.warn(`No table found for group: ${group}`);
                        return;
                    }

                    assignedOptions.forEach(optionName => {
                        const foundOptionTbody = optionTableMap[optionName]
                        if (foundOptionTbody) {
                            foundOptionTbody.appendChild(buildRow(pap));
                        } else {
                            //no option, create own
                            let newOptionTbody = optionTableMap[optionName];
                            if (!newOption) {
                                const table = groupTbody.closest("table");
                                newOptionTbody = table.insertRow().insertCell().appendChild(document.createElement("tbody"));
                                optionTableMap[optionName] = newOptionTbody;

                            }
                            newOptionTbody.appendChild(buildRow(pap));
                            //groupTbody.appendChild(buildRow(pap));
                        }
                    })
                });
            } else {
                document.querySelector('#unassignedTable tbody').appendChild(buildRow(pap));
            }
        });


    } else {

        //tbody.appendChild(createPlaceholderRow());
    }

}
);
// Save everything to <pre>
function updateFilesWithMethod(tableOfContent, method_exec) {
    return tableOfContent.map(item => {
        if (!item.selectedEmote || !item.selectedMethod) return item;

        const raceCodes = method_exec[item.selectedMethod];
        if (!raceCodes || raceCodes.length === 0) return item;

        const pathParts = item.selectedEmote.split('/');
        const codeIndex = pathParts.findIndex(p => /^c\d{4}$/.test(p));
        if (codeIndex === -1) return item;

        const suffixPath = pathParts.slice(codeIndex + 1).join('/');

        const newFiles = {};
        raceCodes.forEach(code => {
            const newPath = pathParts.slice(0, codeIndex).concat(code, suffixPath).join('/');
            newFiles[newPath] = item.fullname;
        });

        return { ...item, Files: newFiles };
    });
}


function saveUpdatedJson(originalJson) {
    const updatedJson = { ...originalJson };
    if (!Array.isArray(updatedJson.Options)) updatedJson.Options = [];

    updatedJson.Options.forEach(option => {
        option.Files = {}; //to add: only clear pap files, leave any other assignment
    });

    tableOfContent = updateFilesWithMethod(tableOfContent, method_exec);

    tableOfContent.forEach(item => {
        if (!item.opit || !item.assignedGamePath) return; //to fix, unassigned might need to go to default_mod.json

        const option = updatedJson.Options.find(opt => opt.Name === item.optit);
        if (option) {
            option.Files[item.assignedGamePath] = item.fullname;
        }

    })
    return updatedJson;
}

function gatherTOCupadates() {
    tableOfContent.forEach(item => {
        // find row by matching first cell text
        const rows = document.querySelectorAll('tr');
        let row = null;
        for (const r of rows) {
            const firstTd = r.querySelector('td:first-child');
            if (firstTd && firstTd.textContent === item.sname) {
                row = r;
                break;
            }
        }
        if (!row) return;

        const methodSelect = row.querySelector('td:nth-child(3) select');
        const emoteSelect = row.querySelector('td:nth-child(4) select');
        const optionCheckbox = row.querySelector('td:nth-child(2) input[type="checkbox"]');

        if (methodSelect) item.selectedMethod = methodSelect.value;
        if (emoteSelect) item.selectedEmote = emoteSelect.value;
        if (optionCheckbox) item.checked = optionCheckbox.checked;
    })
}


document.getElementById("saveBtn").addEventListener("click", () => {
    gatherTOCupadates();

    const container = document.getElementById("saved");
    container.innerHTML = '';

    jsonObjects.forEach(jsonObj => {
        const updatedJson = saveUpdatedJson(jsonObj.jsonData);

        tableOfContent.forEach(item => {
            if (!item.selectedEmote || !item.selectedMethod) return;

            const races = method_exec[item.selectedMethod] || [];
            const option = updatedJson.Options.find(opt => opt.Name === item.optit);
            if (!option) return;

            //fix - selected emote should be first
            races.forEach(race => {
                if (item.assignedOptionPath === '') {
                    //check chosen option, compare with dictionary
                    const path = item.selectedEmote.replace(/c\d{4}/, race);
                    option.Files[path] = item.fullname.replace(/\//g, '\\');
                }
                else {
                    const path = item.assignedOptionPath.replace(/c\d{4}/, race);
                    option.Files[path] = item.fullname.replace(/\//g, '\\');
                }
                //option.Files[path] = item.selectedEmote.replace(/c\d{4}/, race);

            });
        });

        // Put it in the <pre> tag
        const pre = document.createElement("pre");
        pre.className = 'easycopy';
        pre.textContent = JSON.stringify(updatedJson, null, 2);
        container.appendChild(pre);

        console.log(tableOfContent)
    })

});
