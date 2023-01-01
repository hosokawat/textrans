const commandsInput = document.getElementById("commands");
const srcTextArea = document.getElementById("src");
const dstTextArea = document.getElementById("dst");
const showCommandsSpan = document.getElementById("showCommands");
const autocompleteUL = document.getElementById("autocomplete");

(async () => {
  srcTextArea.sync = () => {
    setTimeout(async () => {
      const changed = srcTextArea.value != window.electronAPI.getClipboard();
      if (changed) {
        srcTextArea.value = await window.electronAPI.getClipboard();
        dstTextArea.refresh();
      }
      srcTextArea.sync();
    }, 100);
  };

  srcTextArea.sync();
  dstTextArea.refresh = async () => {
    const commands = commandsInput.value;
    const converted_src = await window.electronAPI.convert(commands);

    if (converted_src) {
      dstTextArea.value = converted_src;
    } else {
      dstTextArea.value = "";
    }
  };

  commandsInput.getCommands = () => {
    if (commandsInput.value) {
      return commandsInput.value.split("|");
    } else {
      return [];
    }
  };

  commandsInput.getLatestCommand = () => {
    if (commandsInput.getCommands().length == 0) {
      return "";
    } else {
      return commandsInput.getCommands().reverse()[0];
    }
  };

  autocompleteUL.commandNames = await window.electronAPI.getCommandDefines();

  autocompleteUL.hide = () => {
    autocompleteUL.selected = 0;
    autocompleteUL.innerHTML = "";
    autocompleteUL.options = [];
    autocompleteUL.word = '';
  }
  autocompleteUL.hide()

  autocompleteUL.selectDown = () => {
    if(autocompleteUL.selected < autocompleteUL.options.length-1) autocompleteUL.selected+=1;
  }
  autocompleteUL.selectUp = () => {
    if(autocompleteUL.selected > 0) autocompleteUL.selected-=1;
  }

  autocompleteUL.updateList = async (word, showAllCommands = false) => {
    let rets = [];
    let change = false;
    if(autocompleteUL.word != word) {
      autocompleteUL.selected = 0;
      autocompleteUL.word = word;
      change = true;
    }

    if (!showAllCommands) {
      // 全コマンド表示モードではなければ表示するかチェックする
      if (word.length == 0) {
        autocompleteUL.hide();
      }
    }

    let matches = "";

    let idx = 0;
    Object.keys(autocompleteUL.commandNames).forEach((key) => {
      if (word.length > 0 && (key.startsWith(word.replace(/^\s+/, ""))) || showAllCommands) {
        const selected = idx == autocompleteUL.selected;
        let _key = key;
        // 前方一致ハイライト
        _key = _key.split("");
        _key.splice(word.length,0,'</span>');
        _key = '<span class="match">' + _key.join("")

        matches =
          matches +
          `<li ${selected ? `class='selected'` : ''}><span class="title">${_key}</span><span class="desc">${autocompleteUL.commandNames[key]}</span></li>`;
        rets.push(key);
        idx+=1;
      }
    });

    autocompleteUL.innerHTML = matches;

    if (rets.length == 0) {
      autocompleteUL.hide();
    }
    autocompleteUL.options = rets;
    return rets;
  };
  commandsInput.applyAutoComplete = (word) => {
    let val = commandsInput.value;
    if (val.includes("|")) {
      commandsInput.value = val.replace(/\|[^\|]+$/, `|${word} `);
    } else {
      commandsInput.value = word + " ";
    }
  };

  commandsInput.addEventListener("keydown", async (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key == "Enter" || e.key == "Tab") {
      e.preventDefault();
    }
  });
  commandsInput.addEventListener("keyup", async (e) => {
    // 正式版はchangeも拾わないといけない
    if (e.key == "Enter" || e.key == "Tab") {
      e.preventDefault();
    }

    dstTextArea.refresh();

    const autoCompleteOptions = await autocompleteUL.updateList(commandsInput.getLatestCommand());
    if (
      (e.key == "Enter" || e.key == "Tab") &&
      autoCompleteOptions[autocompleteUL.selected] &&
      autoCompleteOptions[autocompleteUL.selected] != ""
    ) {
      commandsInput.applyAutoComplete(autoCompleteOptions[autocompleteUL.selected]);
      await autocompleteUL.updateList(commandsInput.getLatestCommand());
    }
  });

  commandsInput.focus();
  showCommandsSpan.addEventListener("click", async (e) => {
    await autocompleteUL.updateList(commandsInput.getLatestCommand(), true);
  });
  window.addEventListener("keydown", (e) => {
    commandsInput.focus();
  });
  window.addEventListener(
    "keyup",
    (e) => {
      console.log(e.key)
      if (e.key === "Escape") {
        window.close();
      }
      if (e.key === "ArrowUp") {
        autocompleteUL.selectUp();
      }
      if (e.key === "ArrowDown") {
        autocompleteUL.selectDown();
      }
    },
    true
  );
})();
