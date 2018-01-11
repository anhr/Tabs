/**
 * JavaScript source code
 * Author: Andrej Hristoliubov
 * email: anhr@mail.ru
 * About me: http://anhr.github.io/AboutMe/
 * source: https://github.com/anhr/Tabs
 * example: http://anhr.github.io/Tabs/
 * Licences: GPL, The MIT License (MIT)
 * Copyright: (c) 2015 Andrej Hristoliubov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Revision:
 *  2017-06-23, : 
 *       + init.
 *
 */

var myTabs = {
    createTabs: function (Ul, tabs, remember) {
        var elUl;
        switch (typeof Ul) {
            case "object":
                elUl = Ul;
                break;
            case "string":
                elUl = document.getElementById(Ul);
                break;
            default: consoleError('myTabs.createTabs(...) failed! typeof elUl: ' + typeof Ul)
                return;
        }
        if (elUl.tagName.toUpperCase() != "UL") {
            consoleError('myTabs.createTabs(...) failed! elUl.tagName: ' + elUl.tagName);
            return;
        }
        elUl.className = "tabs";
        elUl.tabParams = {};
        if (remember)
            elUl.tabParams.remember = remember;
        var isSelected = false;
        var arrayElA = elUl.querySelectorAll('a');
        for (var i = 0; i < arrayElA.length; i++) {
            var elA = arrayElA[i];
            if (elA.className == 'selected') isSelected = true;
            myTabs.prepareTab(elA);
        }
        if (tabs) tabs.forEach(function (tab) {
            var elLi = myTabs.createTab(tab, elUl);
            if (elLi.querySelector('a').className == 'selected') isSelected = true;
            elUl.appendChild(elLi);
        });
        if (!isSelected) consoleError('myTabs.createTabs(...) failed! No any tab has not selected.');
    },
    createTabA: function (tab) {
        var elA = document.createElement('a');
        if (typeof tab.href == 'undefined') {
            consoleError('myTabs.createTabA(...) failed! tab.href: ' + tab.href)
            return null;
        }
        elA.tabParams = {};
        elA.href = tab.href;
        if (typeof tab.name == 'undefined') {
            consoleError('myTabs.createTabA(...) failed! tab.name: ' + tab.name)
            return null;
        }
        elA.innerHTML = tab.name;
        if (tab.selected) elA.className = 'selected';
        if (tab.tabContent) elA.tabParams.tabContent = tab.tabContent;
        return elA;
    },
    createTab: function (tabObject, elUl) {
        var tab = tabObject.tab();
        //Example: <li><a href="#about2" class='selected'>About JavaScript tabs</a></li>
        var elLi = document.createElement('li');
        switch (typeof tab) {
            case "object":
                if (typeof tab.tagName == 'undefined') elLi.appendChild(this.createTabA(tab));
                else {
                    if (tab.tagName.toUpperCase() == "A")
                        elLi.appendChild(tab);
                    else consoleError('myTabs.createTab(...) failed! tab.tagName: ' + tab.tagName);
                }
                break;
            case "string":
                elLi.innerHTML += tab;
                break;
            default: consoleError('myTabs.createTab(...) failed! typeof tab: ' + typeof tab)
                return null;
        }
        var elA = elLi.querySelector('a');
        if (typeof elA.tabParams == 'undefined')
            elA.tabParams = {};
        if (typeof tab.backgroundColor != 'undefined')
            elA.tabParams.backgroundColorCustom = tab.backgroundColor;
        var tabContentId = this.getHash(elA.getAttribute('href'));
        if (elUl.tabParams.remember) {
            var seletedTabId = get_cookie('seletedTab');
            if (seletedTabId != '') {
                var selected = 'selected';
                if (seletedTabId == tabContentId) elA.className = selected;
                else elA.className = elA.className.replace(selected, '');
            }
        }
        var elTabContent = document.getElementById(tabContentId);
        if (!elTabContent) {
            if (typeof tabObject.tabContent == 'undefined') {
                consoleError('elTabContent: ' + elTabContent);
                var elTabContent = document.createElement('div');
                elTabContent.innerHTML = elA.innerText;
                elTabContent.id = tabContentId;
            } else elTabContent = tabObject.tabContent(tabContentId);
            if (elTabContent) this.insertTabContent(elUl, elTabContent);
            else {
                if (elA.className == "selected") {
                    if (typeof elA.tabParams.tabContent == "function") {
                        elUl.appendChild(elLi);
                        elTabContent = elA.tabParams.tabContent(elA);
                    }
                    else consoleError('elA.tabParams.tabContent: ' + elA.tabParams.tabContent);
                } else {
                    elA.onclick = this.showTab;
                    return elLi;
                }
            }
        }
        if (typeof tabObject.backgroundColor != 'undefined')
            elTabContent.style.backgroundColor = tabObject.backgroundColor;
        this.prepareTab(elA);
        return elLi;
    },
    createTabContent: function (elA, getElTabContent) {
        var elTabContent = getElTabContent();
        elTabContent.id = myTabs.getHash(elA.getAttribute('href'));
        this.insertTabContent(elA.parentElement.parentElement, elTabContent);
        this.prepareTab(elA);
        return elTabContent;
    },
    insertTabContent: function (elUl, elTabContent) { elUl.parentElement.insertBefore(elTabContent, elUl.nextSibling); },
    prepareTab: function (elA) {
        var tabContentId = this.getHash(elA.getAttribute('href'));
        var elTabContent = document.getElementById(tabContentId);
        if (!elTabContent) {
            consoleError('elTabContent: ' + elTabContent);
            var elTabContent = document.createElement('div');
            elTabContent.innerHTML = elA.innerText;
            elTabContent.id = tabContentId;
            this.insertTabContent(elA.parentElement.parentElement, elTabContent);
        }
        elTabContent.className = 'tabContent';
        elA.onclick = this.showTab;
        this.showElTabContent(elA, elA.className == 'selected' ? tabContentId : '');
    },
    showTab: function (event) {
        if (!event) event = window.event;
        var elA = event.target || event.srcElement;
        //consoleLog('myTabs.showTab of ' + elA.innerText);
        var selectedId = myTabs.getHash(elA.getAttribute('href'));
        var elUl = elA.parentElement.parentElement;
        if (elUl.tagName.toUpperCase() != "UL") {
            consoleError('myTabs.showTab(...) ' + selectedId + ' failed! elUl.tagName: ' + elUl.tagName);
            return;
        }
        if ((typeof elUl.tabParams != 'undefined') && elUl.tabParams.remember)
            SetCookie('seletedTab', selectedId);
        var arrayElA = elUl.querySelectorAll('a');
        for (var i = 0; i < arrayElA.length; i++) myTabs.showElTabContent(arrayElA[i], selectedId);
        // Stop the browser following the link
        return false;
    },
    showElTabContent: function (elA, selectedId) {
        var tabContentId = myTabs.getHash(elA.getAttribute('href'));
        var elTabContent = document.getElementById(tabContentId);
        if (!elTabContent) {
            if (tabContentId != selectedId)
                return;
            if (typeof elA.tabParams.tabContent == 'undefined')
                consoleError('myTabs.showElTabContent(...) ' + myTabs.getHash(elA.getAttribute('href')) + ' failed! tabContentId ' + tabContentId + ' is not created');
            else elTabContent = elA.tabParams.tabContent(elA);
        }
        if (elTabContent.className.indexOf('tabContent') == -1) {
            consoleError('myTabs.showElTabContent(...) ' + myTabs.getHash(elA.getAttribute('href')) + ' failed! elTabContent.className: ' + elTabContent.className);
            return;
        }
        var hide = ' hide';
        if (tabContentId == selectedId) {
            elA.className = 'selected';
            elTabContent.className = elTabContent.className.replace(hide, '');
            if ((typeof elA.tabParams != 'undefined') && (typeof elA.tabParams.backgroundColorCustom != 'undefined')) {
                elA.style.backgroundColor = elA.tabParams.backgroundColorCustom;
                elTabContent.style.backgroundColor = elA.tabParams.backgroundColorCustom;
            }
            if (elTabContent.className.indexOf(hide) != -1)
                consoleError('myTabs.getElTabContent(...) ' + myTabs.getHash(elA.getAttribute('href')) + ' failed! elTabContent.className: ' + elTabContent.className);
        } else {
            elA.className = '';
            if (elTabContent.className.indexOf(hide) == -1)
                elTabContent.className += hide;
            elA.style.backgroundColor = '';
        }
//        setTimeout(function () { elA.scrollIntoView(); }, 0);
    },
    getHash: function (url) {
        var hashPos = url.lastIndexOf('#');
        return url.substring(hashPos + 1);
    }
}
