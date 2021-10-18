defaultProfileName = 'profile.default';

/**
* init                                2
* Set default values for various forva.
* SQLLiteManager.init()
* @param {object} SQLLiteManager - SQLLiteManager class require('./SQLLiteManager.js'). was included for testing purposes
* @param {string} sql - select * from table_name where active = 1. This was included for testing purposes
* @returns {promise} true on resolve, error on reject
*/
function init() {
  let textarea_sourceElement = document.getElementById('textarea_source');
  if (textarea_sourceElement !== null) {
    textarea_sourceElement.value = '';
  }

  let textarea_resultElement = document.getElementById('textarea_result');
  if (textarea_resultElement !== null) {
    textarea_resultElement.value = '';
  }

  let input_profile_nameElement = document.getElementById('input_profile_name');
  if (input_profile_nameElement !== null) {
    input_profile_nameElement.value = '';
  }

  let input_patternElements = document.getElementsByClassName('input_pattern');
  if (input_patternElements.length > 0) {
    for (let i = 0; i < input_patternElements.length; i += 1) {
      input_patternElements[i].value = '';
    }
  }

  let input_replaceElements = document.getElementsByClassName('input_replace');
  if (input_replaceElements.length > 0) {
    for (let i = 0; i < input_replaceElements.length; i += 1) {
      input_replaceElements[i].value = '';
    }
  }

  loadProfileList();
  loadProfileFromLocalStorage();
}

function loadProfileList(selectedKey = '') {
  removeOptions();
  const items = { ...localStorage };
  let selectElement = document.getElementById('select_profile');
  if (selectElement !== null) {
    if (items !== null) {
      for (let key in items) {
        let keyMatch = key.match(/(profile\.)(.*)/g);
        if (keyMatch !== null) {
          if (key.match(/profile\.default/g)) {
            continue;
          }
          let optionElement = document.createElement('option');
          if (selectedKey === key) {
            optionElement.selected = 'selected';
          }
          optionElement.value = key;
          optionElement.innerHTML = key;
          selectElement.appendChild(optionElement);
        }
      }
    }
  }
}

function buttonNewPattern(patternEntry = { pattern: '', replace: '' }) {
  let regex_pairs = document.getElementsByClassName('regex_pair');
  if (regex_pairs.length > 0) {
    let clone = regex_pairs[regex_pairs.length-1].cloneNode(true);

    let input_patternElement = clone.getElementsByClassName('input_pattern');
    let input_replaceElement = clone.getElementsByClassName('input_replace');
    if (input_patternElement.length > 0) {
      input_patternElement[0].value = patternEntry.pattern;
    }
    if (input_replaceElement.length > 0) {
      input_replaceElement[0].value = patternEntry.replace;
    }

    regex_pairs[regex_pairs.length-1].after(clone);
  }
}

function buttonReplaceLastPattern() {
  let regex_pairs = document.getElementsByClassName('regex_pair');
  if (regex_pairs.length > 1) {
    regex_pairs[regex_pairs.length-1].remove();
  }
}

function buttonExecutePatternReplace() {
  let patternArray = [];
  let textarea_sourceElement = document.getElementById('textarea_source');
  let textarea_resultElement = document.getElementById('textarea_result');

  let regex_pairs = document.getElementsByClassName('regex_pair');
  if (regex_pairs.length > 0) {
    for (let i=0; i<regex_pairs.length ; i += 1) {
      let pattern = '';
      let replace = '';
      
      let patternElement = regex_pairs[i].getElementsByClassName('input_pattern');
      if (patternElement.length > 0) {
        // pattern = patternElement[0].value;
        // pattern = pattern.toString();
        pattern = new RegExp(patternElement[0].value, 'gm');
      }

      let replaceElement = regex_pairs[i].getElementsByClassName('input_replace');
      if (replaceElement.length > 0) {
        replace = replaceElement[0].value;
      }

      let patternReplace = { 'pattern': pattern, 'replace': replace };
      patternArray.push(patternReplace);
    }
  }

  if (textarea_resultElement !== null && textarea_sourceElement !== null) {
    let result = textarea_sourceElement.value;
    for ( let c = 0; c<patternArray.length ; c += 1) {
      result = result.replaceAll(patternArray[c].pattern, patternArray[c].replace);
    }
    textarea_resultElement.value = result;
  }
}

function generateProfile(profileName = null) {
  let regexProfile = {};
  let patternArray = [];
  let textarea_sourceElement = document.getElementById('textarea_source');
  let textarea_resultElement = document.getElementById('textarea_result');

  if (profileName === null) {
    profileName = defaultProfileName;
  }

  let regex_pairs = document.getElementsByClassName('regex_pair');
  if (regex_pairs.length > 0) {
    for (let i=0; i<regex_pairs.length ; i += 1) {
      let pattern = '';
      let replace = '';
      
      let patternElement = regex_pairs[i].getElementsByClassName('input_pattern');
      if (patternElement.length > 0) {
        // pattern = new RegExp(patternElement[0].value, 'gm');
        pattern = patternElement[0].value;
      }

      let replaceElement = regex_pairs[i].getElementsByClassName('input_replace');
      if (replaceElement.length > 0) {
        replace = replaceElement[0].value;
      }

      let patternReplace = { 'pattern': pattern, 'replace': replace };
      patternArray.push(patternReplace);
    }
    
    regexProfile.profileName = profileName;
    regexProfile.patternArray = patternArray;
    regexProfile.source = textarea_sourceElement.value;
  }

  return regexProfile;
}

function saveProfileToLocalStorage(profileName = '') {
  if (profileName === null || profileName === undefined || profileName === '') {
    let input_profile_nameElement = document.getElementById('input_profile_name');
    if (input_profile_nameElement !== null) {
      if (input_profile_nameElement.value === '' || input_profile_nameElement.value === null) {
        // profileName = defaultProfileName;
        let select_profileElement = document.getElementById('select_profile');
        if (select_profileElement !== null) {
          profileName = select_profileElement.value;
        } else {
         profileName = defaultProfileName;
        }
      } else {
        profileName = `profile.${input_profile_nameElement.value}`;
      }
    } else {
      profileName = defaultProfileName;
    }
  }

  let regexProfile = generateProfile(profileName);
  localStorage.setItem(profileName, `${JSON.stringify(regexProfile)}`);
  loadProfileList(profileName);
}

function loadProfileFromLocalStorage(profileName = '') {
  let select_profileElement = document.getElementById('select_profile');

  if (profileName === null || profileName === undefined || profileName === '') {
    profileName = select_profileElement.value;
  }

  let regexProfile = localStorage.getItem(profileName);

  if (regexProfile) {
    regexProfile = JSON.parse(regexProfile);
  }

  clearPatterns();

  if (regexProfile !== null && regexProfile !== undefined) {
    if (regexProfile.patternArray !== null) {
      let patternArray = regexProfile.patternArray;
      for (let i = 0; i<patternArray.length; i += 1) {
        buttonNewPattern(patternArray[i]);
      }
      // remove first pair
      let regex_pairs = document.getElementsByClassName('regex_pair');
      if (regex_pairs.length > 0) {
        regex_pairs[0].remove();
      }
    }
  }

  let textarea_sourceElement = document.getElementById('textarea_source');
  if (textarea_sourceElement !== null) {
    if (regexProfile !== null && regexProfile !== undefined) {
      textarea_sourceElement.value = regexProfile.source;
    }
  }
}

function clearPatterns() {
  let regex_pairs = document.getElementsByClassName('regex_pair');
  if (regex_pairs.length > 1) {
    
    let input_patternElement = regex_pairs[0].getElementsByClassName('input_pattern');
    if (input_patternElement !== null) {
      input_patternElement.value = '';
    }
    let input_replaceElement = regex_pairs[0].getElementsByClassName('input_replace');
    if (input_replaceElement !== null) {
      input_replaceElement.value = '';
    }

    while (regex_pairs.length > 1) {
      regex_pairs[regex_pairs.length-1].remove();
    }
  }
}

function removeOptions() {
  let select_profileElement = document.getElementById('select_profile');
  if (select_profileElement !== null) {
    let selectProfileLength = select_profileElement.options.length;
    for (let i = selectProfileLength-1; i > 0 ; i -= 1) {
      select_profileElement.options[i].remove();
    }
  }
}

function deleteProfile(profileName = '') {
  if (profileName === '' || profileName === null || profileName === undefined) {
    let select_profileElement = document.getElementById('select_profile');
    if (select_profileElement !== null) {
      profileName = select_profileElement.value;
      localStorage.removeItem(profileName);
      clearPatterns();
    }
  } else {
    localStorage.removeItem(profileName);
    clearPatterns();
  }
}

/**
* Saves a .txt text file from from the contents of a textarea.
* @param {string} textarea_id - textarea field id.
*/
function download(textarea_id, fileName = '')
{
   //console.log( "textarea_id: " + textarea_id );
   let text = document.getElementById( textarea_id ).value;
   text = text.replace(/\n/g, "\r\n"); // To retain the Line breaks.
   let blob = new Blob([text], { type: "text/plain"});
   let anchor = document.createElement("a");
   if (fileName === null || fileName === undefined || fileName === '') {
     anchor.download = textarea_id+".txt";
   } else {
     anchor.download = fileName+".txt";
   }
   anchor.href = window.URL.createObjectURL(blob);
   anchor.target ="_blank";
   anchor.style.display = "none";
   document.body.appendChild(anchor);
   anchor.click();
   document.body.removeChild(anchor);
}

function saveProfileToFile() {
  let profile = JSON.stringify(generateProfile());
  let textarea_profileElement = document.getElementById('textarea_profile');
  if (textarea_profileElement !== null) {
    textarea_profileElement.value = profile;

    let select_profileElement = document.getElementById('select_profile');
    if (select_profileElement !== null) {
      profileName = select_profileElement.value;
    } else {
      profileName = defaultProfileName;
    }
    download('textarea_profile', profileName);
  }
}

async function loadProfileFromFile(inputFileElement = null) {
  if (inputFileElement !== null) {
    if (inputFileElement.files.length) {
      let contents = await readFile(inputFileElement.files[0]);
      let fileName = inputFileElement.files[0].name;
      let extension = '';
      let fileNameMatch = fileName.match(/(.+)(\..*)/);
      if (fileNameMatch.length > 1) {
        fileName = fileNameMatch[1];
      }
      if (fileNameMatch.length > 2) {
        extension = fileNameMatch[2];
      }

      let profileName = '';

      let profileNameMatch = fileName.match(/^(profile\..+)/);

      if (profileNameMatch !== null) {
        if (profileNameMatch.length > 1) {
          profileName = profileNameMatch[1];
        } else {
          profileName = `profile.${fileName}`;
        }
      } else {
        profileName = `profile.${fileName}`;
      }

      // console.log(`profileName: ${profileName}`);

      let regexProfile = contents;            
      console.log(`regexProfile: ${regexProfile}`);
      localStorage.setItem(profileName, `${regexProfile}`);
      loadProfileList(profileName);
      loadProfileFromLocalStorage(profileName);
    }
  }
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    let fr = new FileReader();
    fr.onload = x=> resolve(fr.result);
    fr.readAsText(file);
  });
}