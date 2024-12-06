/*
    The implementation of this widget was following the guidelines set out by w3.org
    
    For more info look at the following documentation -> https://www.w3.org/TR/wai-aria-practices/examples/menu-button/menu-button-links.html
    
    For details on how this widget works look here -> https://docs.google.com/document/d/1M1-qOzavkAZ5xZqFTym71rUwkgU-269rSK2MO0x7HfI/edit?usp=sharing
*/
(function ($) {
    // These keys represent keyboard controls use to make navigation accessibile
    var KEYCODES = Object.freeze({
        TAB: 9,
        RETURN: 13,
        ESC: 27,
        SPACE: 32,
        PAGEUP: 33,
        PAGEDOWN: 34,
        END: 35,
        HOME: 36,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
    });
    // this list make searching the key codes easier, enabling you to perform .indexOf on the control list
    var CODEKEYS = Object.keys(KEYCODES).map(function (key) { return KEYCODES[key]; });

    function stopEvent(ev) {
        // this is helper that stops event from taking any action
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
    }

    function isNodesRelated(target, source) {
        // this detect whether the target DOM element is the same or is a child of the source
        return (target && source && (source.isSameNode(target) || source.contains(target)))
    }
    
    // this widget is attached to each menu item that has a child menu
    // its primary function is to handle the opening/closing/toggling of the child menu
    $.widget('q4.navMenu', {
        _$menu: null, // the child menu element of the menu item
        _animationFrame: null, // this is a timeout id used to cancel timeouts to enable smooth transitions of menus opening/closing
        options: {
            onOpen: function () {}, // an event handler that is called when the child menu opens
            onClose: function () {}, // an event handler that is called when the child menu closes
            type: 'desktop', // type is used to determine the css properties that need to be changed when toggling child menu state
            style: 'list', // style is used to determine how the child menu state will change
            navWrapper: '.nav--desktop', // a selector of which the nav is rendered into
            animationTime: 500, // this sets the speed of transition betweeen states
            isSplit: false, // splitting the nav changes how some menus open
            isMobile: false, // used to determine if destination is mobile menu
            fx: 'pop' // the transition effect of opening/closing the menu
        },
        _openList: function () {
            var inst = this;
            var options = inst.options;
            var $button = inst.element;
            var $menu = inst._$menu;
            
            function openPop(levelCheck, minWidth) {
                
                if ($menu.hasClass(levelCheck)) {
                    $menu.css({
                         'opacity': '1',
                         'position': 'absolute',
                         'top': '100%',
                         'left': '0px',
                         'min-width': minWidth
                    });
                 } else {
                     $menu.css({
                         'opacity': '1',
                         'position': 'absolute',
                         'top': '0px',
                         'left': '100%',
                         'min-width': minWidth
                     });
                 }
            }

            function openDesktop() {
                var menuRect = $menu[0].getBoundingClientRect(); // gets the abosulte dimensions of the child menu
                var parentRect = $button.parent()[0].getBoundingClientRect(); // gets the abosulte dimensions of parent of the menu item
                var minWidth = parentRect.width >= menuRect.width ? parentRect.width : menuRect.width; // we need to ensure the that width of the child menu isnt smaller than the menu item
                var levelCheck = options.isSplit ? 'level2' : 'level1';
                
                minWidth = (minWidth >= 200 ? minWidth : 200) + 'px';

                switch (options.fx) {
                    case 'pop':
                    default:
                        openPop(levelCheck, minWidth);
                        break;
                }
            }
            
            // by default the child menu is set to display:none, so we need to have it shown before we can interact with it
            $menu.show();

            switch (options.type) {
                case 'desktop':
                    openDesktop();
                    break;
            }
        },
        _openExpand: function () {
            var inst = this;
            var options = inst.options;
            var $menu = inst._$menu;
            
            // by default the child menu is set to display:none, so we need to have it shown before we can interact with it
            $menu.show();

            function openPop() {
                $menu.css({
                    'opacity': '1'
                });
            }

            function openMobile() {

                switch (options.fx) {
                    case 'pop':
                    default:
                        openPop();
                       break; 
                }
            }

            switch (options.type) {
                case 'mobile':
                    openMobile();
                    break;
            }
        },
        _openPanel: function () {
            var inst = this;
            var options = inst.options;
            var $button = inst.element;
            var $menu = inst._$menu;
            var $parentMenu = $menu.parent().parent(); // this is the panel of the menu item
            var $panelControl = $menu.find('.panel-control .button'); // this is the back button of the child menu
            var $navWrapper = $(options.navWrapper);
            var topPos = $parentMenu.hasClass('level0') ? $navWrapper.scrollTop() : $parentMenu.scrollTop();

            if (inst._animationFrame) {
                // if the menu is closing, cancel it
                clearTimeout(inst._animationFrame);
                clearTimeout(inst._focusDelay);
            }

            // make keyboard trap for opened menu
            $button.attr('aria-hidden', true);
            $menu.parent().siblings().attr('aria-hidden', true);
            $navWrapper.children().not('.level0').attr('aria-hidden', true);
            
            // by default the child menu is set to display:none, so we need to have it shown before we can interact with it
            $menu.show();
            $menu.css({
                'opacity': '1',
                'z-index': '1',
                'top': topPos <= 0 ? 0 : topPos
            });
            // this prevents multiple scrollbars from appearing
            $parentMenu.css({
                'overflow-y': 'hidden'
            });
            
            $navWrapper.css({
                'overflow-y': 'hidden'
            });

            inst._animationFrame = setTimeout(function () {
                // animate the child menu opening    
                window.requestAnimationFrame(function () {
                    $menu.css({
                        'transform': 'translateX(0)'
                    });
                    $('button[aria-controls="'+$panelControl.attr('aria-controls')+'"]').attr('aria-expanded', 'true');

                    // only focus once animation has ended and menu has come into view 
                    inst._focusDelay = setTimeout(function () {
                        $menu.siblings().hide();
                        $panelControl.focus();
                    }, options.animationTime + 1);
                });
            }, 1);
        },
        _closePanel: function () {
            var inst = this;
            var options = inst.options;
            var $menu = inst._$menu;
            var $parentMenu = $menu.parent().parent(); // this is the panel of the menu item
            var $panelControl = $menu.find('.panel-control .button'); // this is the back button of the child menu
            var $navWrapper = $(options.navWrapper);

            if (inst._animationFrame) {
                // if the menu is opening, cancel it
                clearTimeout(inst._animationFrame);
            }

            // remove keyboard trap from opened menu
            $menu.siblings().show().removeAttr('aria-hidden');
            $menu.parent().siblings().removeAttr('aria-hidden');
            $navWrapper.children().not('.level0').removeAttr('aria-hidden');

            // closing the menu
            $menu.css({
                'transform': ''
            });

            inst._animationFrame = setTimeout(function () {
                // after the menu closes, hide it
                window.requestAnimationFrame(function () {
                    $menu.css({
                        'opacity': '0',
                        'z-index': '-1'
                    });
                    $parentMenu.css({
                        'overflow-y': 'auto'
                    });
                    if ($parentMenu.hasClass('level0')) {
                        $navWrapper.css({
                            'overflow-y': ''
                        });
                    }
                    $menu.hide();
                    // bring focus back to the menu item
                    $menu.siblings()[0].focus();
                    options.onClose();
                    $('button[aria-controls="'+$panelControl.attr('aria-controls')+'"]').attr('aria-expanded', 'false');
                });
            }, options.animationTime);
        },
        _isRelated: function (target) {
            // is checks to see if the target is related to the menu item or the child menu
            var inst = this;
            var $parentMenu = inst.element.parent();

            return isNodesRelated(target, $parentMenu[0]);
        },
        _isAllRelated: function (targets) {
            // is checks to see if all targets are related to the menu item or the child menu
            var related;
            var inst = this;
            var allRelated = true;

            for (var i = 0, ii = targets.length; i < ii; i++) {
                related = inst._isRelated(targets[i]);

                if (!related) {
                    allRelated = false;
                    break;
                }
            }

            return allRelated;
        },
        open: function (ev) {
            var inst = this;
            var options = inst.options;
            var $button = inst.element; // menu item
            var target = ev.relatedTarget; // element that trigger the event
            var $parentMenu = $button.parent().parent(); // the parent menu of the menu item

            if (options.isMobile && $parentMenu.hasClass('level0')) {
                // reset the tabbing of the top-level navigation items if we are at the top level
                $parentMenu.find(' li > [tabindex="0"]').attr('tabindex', '-1');
            }
            
            // get all open menus
            var activeMenus = $('.has-innerMenu button[aria-expanded="true"]');
            
            $button.attr('aria-expanded', 'true');

            // open child menu, which depends on style
            switch (options.style) {
                case 'list':
                    activeMenus.navMenu('close', { relatedTarget: $button[0], type: 'menu-open'});
                    inst._openList();
                    break;
                case 'expand':
                    activeMenus.navMenu('close', { relatedTarget: $button[0], type: 'menu-open'});
                    inst._openExpand();
                    break;
                case 'panel':
                    inst._openPanel();
                    break;
            }

            options.onOpen(); // trigger event handler for the child menu opening
        },
        close: function (ev) {
            var inst = this;
            var options = inst.options;
            var $button = inst.element; // menu item
            var $menu = inst._$menu; // child menu
            var $parentMenu = $button.parent().parent(); // the parent menu of the menu item
            var target = ev.relatedTarget; // element that trigger the event

            if (inst._isRelated(target)) {
                // if the target is related to this menu, keep it open
                return;
            }

            // reset the menu item to its default state
            $button.attr('aria-expanded', 'false');

            if (options.isMobile) {
                var $lastMenuItem = $parentMenu.find(' li > [tabindex="0"]');

                if (!$parentMenu.hasClass('level0') || ($parentMenu.hasClass('level0') && $lastMenuItem.length > 1 && !inst._isAllRelated($lastMenuItem))) {
                    $button.attr('tabindex', '-1');
                }
            }

            function closePop() {
                $menu.css('opacity', '0');
                $menu.hide();
                options.onClose();
            }

            // close child menu, which depends on style
            switch (options.style) {
                case 'panel':
                    inst._closePanel();
                    break;
                case 'list':
                case 'expand':
                default:

                    switch (options.fx) {
                        case 'pop':
                        default:
                            closePop();
                            break;
                    }
                    
                    break;
            }
        },
        toggle: function (ev) {
            // this toggles the state of the child menu
            var inst = this;
            var $button = inst.element;

            if ($button.attr('aria-expanded') === 'true') {
                inst.close(ev);
            } else {
                inst.open(ev);
            }
        },
        _create: function () {
            // this sets the defaul attributes and apply event handling to the menu item
            var inst = this;
            var options = inst.options;
            var $button = inst.element;

            if (!$button) {
                return;
            }

            inst._$menu = $('#' + $button.attr('aria-controls'));

            var $menu = inst._$menu;
            
            if (!$menu.attr('aria-labelledby') && !$menu.attr('aria-label') && !$menu.attr('title')) {
                label = $menu[0].innerHTML;
                $menu.attr('aria-label', label);
            }

            $menu[0].tabIndex = -1;
            $menu.attr('role', 'menu');
            $menu.css('opacity', '0');
            $menu.hide();

            $button.on('click', function (ev) {
                inst.toggle(ev);
            });
            
            if (options.type === 'mobile') {
                return;
            }

            $button.parent().on('mouseenter', function (ev) {
                inst.open(ev);
            });

            $button.parent().on('blur mouseleave', function (ev) {
                inst.close(ev);
            });
        },
        destroy: function () {
            this.element.html('');
        },
        _setOption: function () {
            this._superApply(arguments);
        }
    });

    // this widget acts as a service and controller of the navigation
    // as a service it generates the HTML for the desktop/mobile navigation
    // as a controller it handles the keyboard events to open/close/toggle child menu and move the focus of the current menu item
    $.widget('q4.nav', {
        _animationFrame: null,
        _animationFrameSplit: null,
        options: {
            // GLOBAL OPTIONS
            menuItemClassSelected: 'selected', // this class gets applied to the menu item that represents the current page
            menuItemClassExpanded: 'expanded', // this class gets applied to the parent menu items of the selected menu item
            destWrapper: 'form > .layout', // a selector to grab the root page element
            destContent: '.layout_inner', // a selector to grab the page content element
            breakpoint: 1024, // typical breakpoints are 1024px (tablet) and 768px (phone), used to determine current state
            animationTime: 500, // how long css transitions will take
            includeRootElement: true, // flag to determine whether or not to include the 'Overview' page in the nav
            // DESKTOP OPTIONS
            hasDesktopMenu: true, // a flag to control the existance of the menu
            destDesktop: '.nav--desktop', // a selector of which the nav will be rendered into
            dirDesktop: 'hoz', // defines how the nav should be displayed: hoz (horizontal), vert (vertical)
            styleDesktop: 'list', // the style of the child menus
            iconMenuTop: 'q4-icon_chevron-down', // the icon used for top-level menu items that have child menus
            iconMenuInner: 'q4-icon_chevron-right', // the icon used for inner menu items that have child menus
            includeSearchDesktop: true, // option to include the searchbar or not
            searchFormIdDesktop: 'navDesktopSearchForm', // selector used to id desktop search form
            destSearchTooltip: '#search-tip', // Id of the tooltip that appears when clicking the search button
            searchTooltipLabel: 'Search', // tooltip text that appears when clicking the search button
            menuFxDesktop: 'pop', // the transition effect of opening/closing the menu: pop
            // DESKTOP SPLIT OPTIONS
            includeChildrenDesktop: true, // should the desktop nav include child menus
            splitDesktop: false, // a flag to indicate whether or not to split the nav in two: header nav for top level links and a secondary nav for IR pages
            destDesktopSplit: '.nav--ir--desktop', // where to put the secondary nav
            splitSourceDesktop: 'investor relations', // the data source for the secondary nav
            dirDesktopSplit: 'hoz', // defines how the nav should be displayed: hoz (horizontal), vert (vertical)
            styleDesktopSplit: 'list', // the style of the child menus
            includeSearchDesktopSecondary: false, // render search on secondary nav or not
            searchDesktopSecondaryIdSuffix: 'Secondary',
            destSearchTooltipSecondary: '#search-tip-secondary', // Id of the tooltip that appears when clicking the search button
            // MOBILE OPTIONS
            hasMobileMenu: true, // a flag to control the existance of the menu
            destMobileToggle: '.nav--mobile--toggle', // a selector for the button that toggles the nav
            destMobile: '.nav--mobile', // a selector to be used to wrap the nav
            dirMobile: 'right', // defines where to place the nav: right, left
            styleMobile: 'expand', // defines how the nav should be displayed: expand, panel 
            includeSearchMobile: true, // option to include the searchbar or not
            dirSearchMobile: 'top', // option to set where the searchbar will be rendered: top, bottom
            searchFormIdMobile: 'navMobileSearchForm', // selector used to id mobile search form
            destSearchMobile: '.nav--mobile--search_container--input', // a selector that targets the searchbar
            classMobileOpen: 'js--mobile', // class applied to the root page element when the nav is opened
            backButtonLabel: '{{{parent.text}}}', // mustache tempalate for mobile inner menu's previous menu button
            menuFxMobile: 'pop', // the transition effect of opening/closing the menu: pop, slide-down
            screenReaderObstaclesMobile: 'iframe[title="recaptcha challenge"], .qassist-descr, .qassist-badge', // selector for undesired elements that screenreader is able to reach when the mobile menu is open 
            // MOBILE SPLIT OPTIONS
            includechildrenMobile: true, // should the mobile nav include child menus
            splitMobile: false, // a flag to indicate whether or not to split the nav in two: header nav for top level links and a secondary nav for IR pages
            destMobileToggleSplit: '.nav--ir--mobile--toggle', // a selector for the button that toggles the nav
            destMobileSplit: '.nav--ir--mobile', // where to put the secondary mobile nav
            splitSourceMobile: 'investor relations', // the data source for the secondary nav
            styleMobileSplit: 'expand', // the style of the child menus
            classMobileOpenSplit: 'js--mobile--ir', // class applied to the root page element when the nav is opened
            // EVENT HANDLERS
            beforeExtractData: function ($navLinks) {}, // called before the navigation data has been extracted
            afterExtractData: function (data) {}, // called after the navigation data has been extracted
            beforeRender: function (event) {}, // called just before a nav is rendered
            beforeRenderDesktop: function (templates) {}, // called just before the mobile nav is rendered
            beforeRenderMobile: function (templates) {}, // called just before the mobile nav is rendered
            onComplete: function () {}, // called when the nav(s) have finished being created / initialized
            animateOpenMobile: function () {}, // called when the mobile nav opens 
            animateCloseMobile: function (end) { end(); }, // called when the mobile nav closes
            animateOpenMobileSplit: function () {}, // called when the mobile nav opens 
            animateCloseMobileSplit: function (end) { end(); } // called when the mobile nav closes
        },
        _extractData: function ($elems, levelParent, dataParent) {
            // this intakes the raw nav elements and constructs a meta data object used to power the nav templates
            levelParent = levelParent || 0; 

            var inst = this;
            var options = inst.options;
            var data = [];
            var levelCurrent = levelParent + 1; // determines how depth of the current child menu item

            $elems.each(function(idx) {
                var $this = $(this);
                var $link = $this.find('> a');
                var $elemsSub = $this.find('> ul > li');
                var url = $link.attr('href');
                var urlSplit = url.toLowerCase().split('.');
                var expanded = $this.hasClass('expanded');
                var selected = $this.hasClass('selected');
                var itemData = {
                        menuId: 'menu-' + (dataParent ? dataParent.position + '-' + idx : idx), // used in the template to id the menu item and its child menu
                        level: 'level' + levelCurrent,
                        position: idx, // determines where in the parent menu this menu item is
                        parent: dataParent, // provides inheritance to the parent menu item
                        expanded: expanded, // a flag used in the tempaltes
                        selected: selected, // a flag used in the tempaltes
                        tabindex: (expanded || selected) ? 0 : -1, // used in the template to set initial tab focus
                        expandedClass: expanded ? options.menuItemClassExpanded : '', // a class applied to the menu item
                        selectedClass: selected ? options.menuItemClassSelected : '', // a class applied to the menu item
                        href: $link.attr('href'), // the url that the menu item points to
                        text: $link.html(), // the text of the menu item
                        target: urlSplit[urlSplit.length - 1].indexOf('aspx') > -1 ? '_self' : '_blank', // determine how the link should be opened in the browser
                        hasChildren: $elemsSub.length ? true : false, // does this menu item have a child menu
                        children: null,
                        iconMenu: null
                    };
                
                // to handle when pages are setup to link internally
                if (itemData.href === options.rootLink.href) {
                    itemData.selected = options.rootLink.isSelected;
                    if (itemData.selected) {
                        selected = true;
                        itemData.selectedClass = options.menuItemClassSelected;
                    }
                }

                if (selected) {
                    // if the menu item is the current page, allow simple access to it
                    // $([NAV_DATA_CLASS]).nav('option', 'currentItem');
                    options.currentItem = itemData;
                }

                if (itemData.hasChildren) {
                    var levelCheck = options.splitDesktop ? 2 : 1;

                    itemData.children = inst._extractData($elemsSub, levelCurrent, itemData); // if this menu item has a child menu, get the data
                    itemData.iconMenu = (levelCurrent > levelCheck) ? options.iconMenuInner : options.iconMenuTop // determines which icon to apply
                }

                // To add selected class for links that include anchors and redirect to another page
                var windowLocation = window.location;
                if (itemData.hasChildren && selected && windowLocation.hash !== '') {
                    selectedUrl = windowLocation.pathname + windowLocation.hash;

                    for (var child = 0; child < itemData.children.length; child++) {
                        if (selectedUrl == itemData.children[child].href) {
                            itemData.children[child].selected = true;
                            itemData.children[child].selectedClass = options.menuItemClassSelected;
                        }
                    }                    
                }

                data.push(itemData);
            });

            function updateRootChildren() {
                $.each(data, function (idx, child) {
                    child.parent = dataParent;
                });
            }

            if (levelParent === 0) {
                dataParent = {
                    menuId: 'menu-parent',
                    level: 'level0',
                    position: -1,
                    parent: null,
                    expanded: true,
                    selected: false,
                    tabindex: -1,
                    expandedClass: '',
                    selectedClass: '',
                    href: '',
                    text: 'Back',
                    target: '',
                    hasChildren: true,
                    children: data,
                    iconMenu: null
                }

                updateRootChildren();
            }

            return data;
        },
        _buildDesktopSearchTemplate: function (searchIdSuffix) {
            var inst = this;
            var options = inst.options;
            var searchWrapper = options.classSearchDesktop;
            var searchId = 'navDesktopSearch' + (searchIdSuffix ? searchIdSuffix : '');
            var searchIdText = searchId + 'Text';
            var searchIdBtn = searchId + 'Btn';
            var searchIdInput = searchId + 'Input';
            var formId = options.searchFormIdDesktop;
            var $searchForm = $('<form id="'+ formId +'" action="/search-results" method="post"></form>');
            var searchbar = (
                    '<div id="'+ searchId +'" class="'+ searchWrapper +'">' +
                        '<label id="'+ searchIdText +'" class="'+ searchWrapper +'--text module-search_text sr-only" for="'+ searchIdInput +'">Search query</label>' +
                        '<button id="'+ searchIdBtn +'" class="'+ searchWrapper +'--btn" form="'+ formId +'" type="button" aria-label="Click to open search" aria-expanded="false" aria-haspopup="true" aria-controls="'+ searchIdInput +'"><span class="button_text q4-icon_search" aria-hidden="true"></span></button>' +
                        '<input id="'+ searchIdInput +'" class="'+ searchWrapper +'--input" name="SearchTerm" form="'+ formId +'" type="text" maxlength="256" title="Search query" placeholder="Search">' +
                    '</div>'
                );

            function updateSearchAction(ev) {
                var searchValue = $('#' + searchIdInput).val();
                
                $searchForm.attr('action', '/search-results?SearchTerm='+searchValue);
            };

            $('body').append($searchForm);
            $('#' + formId).on('submit', updateSearchAction);
            return searchbar;
        },
        _buildTemplateDesktop: function () {
            // this function builds the template for the top-level desktop nav
            var template, templateItem;
            var inst = this;
            var options = inst.options;
            var type = options.classDesktop + (options.styleDesktop ? '--' + options.styleDesktop : '') + '--topMenu';
            var searchbar;

            if (options.includeSearchDesktop) {
                searchbar = inst._buildDesktopSearchTemplate();
            }

            switch (options.styleDesktop) {
                case 'list':
                default:
                    
                    if (options.includeChildrenDesktop) {
                        templateItem = (
                            /* beautify preserve:start */
                            // @formatter:off
                            '<li class="'+ type +'--menuItem {{#hasChildren}}has-innerMenu{{/hasChildren}} {{expandedClass}} {{selectedClass}}" role="none">' +
                                '{{^hasChildren}}' +
                                    '<a class="link" target="{{target}}" href="{{href}}" {{#selected}}aria-current="page"{{/selected}}>' +
                                        '<span class="text">{{{text}}}</span>' +    
                                    '</a>' +
                                '{{/hasChildren}}' +
                                '{{#hasChildren}}' +
                                    '<button id="button--{{menuId}}-desktop" class="button" type="button" aria-controls="{{menuId}}-desktop" aria-haspopup="true" aria-expanded="false">' +
                                        '<span class="text">{{{text}}}</span>' +
                                        '<span class="icon {{iconMenu}}" aria-hidden="true"></span>' +
                                    '</button>' +
                                    '{{#hasChildren}}{{>innerMenu}}{{/hasChildren}}' +
                                '{{/hasChildren}}' +
                            '</li>'
                            // @formatter:on
                            /* beautify preserve:end */
                        );
                    } else {
                        templateItem = (
                            /* beautify preserve:start */
                            // @formatter:off
                            '<li class="'+ type +'--menuItem {{expandedClass}} {{selectedClass}}" role="none">' +
                                '<a class="link" target="{{target}}" href="{{href}}" {{#selected}}aria-current="page"{{/selected}}>' +
                                    '<span class="text">{{{text}}}</span>' +    
                                '</a>' +
                            '</li>'
                            // @formatter:on
                            /* beautify preserve:end */
                        );
                    }
                    
                    break;
            }

            template = (
                /* beautify preserve:start */
                // @formatter:off
                '<ul class="'+ type +' level0" role="menu">' +
                    '{{#.}}' +
                        templateItem +
                    '{{/.}}' +
                '</ul>' +
                (options.includeSearchDesktop ? searchbar : '')
                // @formatter:on
                /* beautify preserve:end */
            );

            return template;
        },
        _buildTemplateDesktopSplit: function () {
            var template, templateItem;
            var inst = this;
            var options = inst.options;
            var type = options.classDesktop + (options.styleDesktopSplit ? '--' + options.styleDesktopSplit : '') + '--topMenu';
            var searchbar;

            if (options.includeSearchDesktopSecondary) {
                searchbar = inst._buildDesktopSearchTemplate(options.searchDesktopSecondaryIdSuffix);
            }

            switch (options.styleDesktop) {
                case 'list':
                default:
                    templateItem = (
                        /* beautify preserve:start */
                        // @formatter:off
                        '<li class="'+ type +'--menuItem {{#hasChildren}}has-innerMenu{{/hasChildren}} {{expandedClass}} {{selectedClass}}" role="none">' +
                            '{{^hasChildren}}' +
                                '<a class="link" target="{{target}}" href="{{href}}" role="menuitem" tabindex="{{tabindex}}" {{#selected}}aria-current="page"{{/selected}}>' +
                                    '<span class="text">{{{text}}}</span>' +    
                                '</a>' +
                            '{{/hasChildren}}' +
                            '{{#hasChildren}}' +
                                '<button id="button--{{menuId}}-desktop" class="button" type="button" aria-controls="{{menuId}}-desktop" aria-role="menuitem" aria-haspopup="true" aria-expanded="false" tabindex="{{tabindex}}">' +
                                    '<span class="text">{{{text}}}</span>' +
                                    '<span class="icon {{iconMenu}}" aria-hidden="true"></span>' +
                                '</button>' +
                                '{{#hasChildren}}{{>innerMenu}}{{/hasChildren}}' +
                            '{{/hasChildren}}' +
                        '</li>'
                        // @formatter:on
                        /* beautify preserve:end */
                    );
                    break;
            }

            template = (
                /* beautify preserve:start */
                // @formatter:off
                '<ul class="'+ type +' level0">' +
                    '{{#.}}' +
                        templateItem +
                    '{{/.}}' +
                '</ul>' +
                (options.includeSearchDesktopSecondary ? searchbar : '')
                // @formatter:on
                /* beautify preserve:end */
            );

            return template;
        },
        _buildTemplateDesktopInner: function () {
            // this function builds the template for child menus of the desktop nav
            var template, templateItems;
            var inst = this;
            var options = inst.options;
            var type = options.classDesktop + (options.styleDesktop ? '--' + options.styleDesktop : '') + '--innerMenu';

            switch (options.styleDesktop) {
                case 'list':
                default:
                    templateItems = (
                        /* beautify preserve:start */
                        // @formatter:off
                            '{{#children}}' +
                                '<li class="'+ type +'--menuItem {{#hasChildren}}has-innerMenu{{/hasChildren}} {{expandedClass}} {{selectedClass}}" role="none">' +
                                    '{{^hasChildren}}' +
                                        '<a class="link" target="{{target}}" href="{{href}}" role="menuitem" {{#selected}}aria-current="page"{{/selected}}>' +
                                            '<span class="text">{{{text}}}</span>' +    
                                        '</a>' +
                                    '{{/hasChildren}}' +
                                    '{{#hasChildren}}' +
                                        '<button id="button--{{menuId}}-desktop" class="button" type="button" aria-controls="{{menuId}}-desktop" aria-role="menuitem" aria-haspopup="true" aria-expanded="false">' +
                                            '<span class="text">{{{text}}}</span>' +
                                            '<span class="icon {{iconMenu}}" aria-hidden="true"></span>' +
                                        '</button>' +
                                        '{{#hasChildren}}{{>innerMenu}}{{/hasChildren}}' +
                                    '{{/hasChildren}}' +
                                '</li>' +
                            '{{/children}}'
                        // @formatter:on
                        /* beautify preserve:end */
                    );
                    break;
            }

            template = (
                /* beautify preserve:start */
                // @formatter:off
                    '<ul id="{{menuId}}-desktop" class="{{level}} '+ type +'" role="menu" aria-labelledby="button--{{menuId}}-desktop">' +
                        templateItems +
                    '</ul>'
                // @formatter:on
                /* beautify preserve:end */
            );

            return template;
        },
        _addDesktopSearchHandlers: function (destTooltip, searchIdSuffix) {
            var inst = this;
            var options = inst.options;
            var searchId = '#navDesktopSearch' + (searchIdSuffix ? searchIdSuffix : '');
            var $searchBtn = $(searchId + 'Btn');
            var $searchInput = $(searchId + 'Input');
            var $searchTooltip = $(destTooltip);
            var $searchForm = $('#' + options.searchFormIdDesktop);

            function handleKeyPressSearchForm(ev) {
                
                switch (ev.keyCode) {
                    case KEYCODES.ESC:
                        closeSearchInput();
                        $searchBtn.focus();
                        break;
                    case KEYCODES.RETURN:
                        $searchForm.submit();
                        break;
                }
            }

            function openSearchInput() {
                $search = $(options.destDesktop + '--search_container');
                $searchBtn.attr({
                    'aria-label': 'Click to close search',
                    'aria-expanded': 'true'
                });
                $searchInput.show().focus();
                $searchInput.removeClass('closed');
                $searchInput.addClass('opened');
                inst._addSearchFocusTooltip($searchTooltip, $search);
            }

            function closeSearchInput() {
                $searchBtn.attr({
                    'aria-label': 'Click to open search',
                    'aria-expanded': 'false'
                });
                $searchInput.hide();
                $searchInput.removeClass('opend');
                $searchInput.addClass('closed');
                inst._removeSearchFocusTooltip($searchTooltip);
            }

            function toggleSearchInput(ev) {
                
                if (ev.type === 'mousedown' || ev.keyCode === KEYCODES.RETURN) {
                    stopEvent(ev);

                    if ($searchInput.hasClass('closed')) {
                        openSearchInput();
                    } else {
                        closeSearchInput();
                    }
                }
            }
            
            $searchInput.hide().addClass('closed');
            $searchInput.on('keydown', handleKeyPressSearchForm);
            $searchInput.on('blur', closeSearchInput);
            $searchBtn.on('keydown mousedown', toggleSearchInput);
        },
        _renderDesktop: function () {
            // this function renders the desktop nav
            var inst = this;
            var options = inst.options;
            var $desktop = $(options.destDesktop);

            $desktop.addClass(options.dirDesktop);

            var templates = {
                top: inst._buildTemplateDesktop(),
                inner: inst._buildTemplateDesktopInner()
            };

            if (options.splitDesktop) {
                templates.split = inst._buildTemplateDesktopSplit();
            }

            options.beforeRender({
                type: 'render-template-dekstop',
                templates: templates
            });
            options.beforeRenderDesktop(templates);

            $desktop.html(
                Mustache.render(
                    templates.top,
                    options.data,
                    {
                        "innerMenu": templates.inner
                    }
                )
            );

            if (options.splitDesktop) {
                var $splitDesktop = $(options.destDesktopSplit);

                $splitDesktop.addClass('nav--split');
                $splitDesktop.addClass(options.dirDesktopSplit);
                $splitDesktop.html(
                    Mustache.render(
                        templates.split,
                        options.dataSplitDesktop,
                        {
                            "innerMenu": templates.inner
                        }
                    )
                );
            }

            if (options.includeSearchDesktop) {
                inst._addDesktopSearchHandlers();
            }

            if (options.includeSearchDesktopSecondary) {
                inst._addDesktopSearchHandlers(options.destSearchTooltipSecondary, options.searchDesktopSecondaryIdSuffix);
            }
        },
        _openNavMobile: function () {
            // this function applies attributes and styling needed to open the mobile nav
            var $tabElem;
            var inst = this;
            var options = inst.options;
            var $wrapper = $(options.destWrapper); // the root page element
            var $mobile = $(options.destMobile); // the mobile nav
            var $toggle = $(options.destMobileToggle); // the button that toggles the menu state
            var $innerToggle = $mobile.find(options.destMobileToggle);
            var $childMenuItem = $mobile.find('> ul > li').first(); // the first item in the nav
            var selectorChildTarget = $childMenuItem.hasClass('has-innerMenu') ? ' > button' : ' > a'; // the menu item can be a link or a button
            var $childTarget = $childMenuItem.find(selectorChildTarget); // the menu item
            var $content = $(options.destContent) //content of the page excluding the mobile nav
            var $screenReaderObstacles = $(options.screenReaderObstaclesMobile); //specified elements that are reachable by screenreader when mobile is open

            // apply aria attrs to indicate the current state of the mobile nav
            $toggle.attr({
                'aria-label': 'Click to close mobile menu',
                'aria-expanded': 'true',
            });

            if (inst._animationFrame) {
                // if the nav is closing, stop it
                clearTimeout(inst._animationFrame);
            }
            
            // the mobile nav is hidden by default, so we need to show it before interacting with it
            $mobile.show();
            
            //ensures there is a link accessible by tabbing on mobile nav
            $childTarget.attr('tabindex', '0');

            $innerToggle.focus()

            // hiding page contents from screenreader
            $content.attr('aria-hidden', 'true');

            // hiding other undesired elements from screenreader
            $screenReaderObstacles.attr('aria-hidden', 'true');

            inst._animationFrame = setTimeout(function () {
                // trigger the menu opening
                window.requestAnimationFrame(function () {
                    $wrapper.addClass(options.classMobileOpen);
                    options.animateOpenMobile();
                });
            }, 1);
        },
        _closeNavMobile: function (ev) {
            // this function applies attributes and styling needed to close the mobile nav
            var inst = this;
            var options = inst.options;
            var $toggle = $(options.destMobileToggle); // the button that toggles the menu state
            var $wrapper = $(options.destWrapper); // the root page element
            var $mobile = $(options.destMobile); // the mobile nav
            var $content = $('.layout_inner') //content of the page excluding the mobile nav
            var $screenReaderObstacles = $(options.screenReaderObstaclesMobile); //specified elements that are reachable by screenreader when mobile is open

            // apply aria attrs to indicate the current state of the mobile nav
            $toggle.attr({
                'aria-label': 'Click to open mobile menu',
                'aria-expanded': 'false',
            });

            // unhide page content when mobile nav closes
            $content.removeAttr('aria-hidden');
            $screenReaderObstacles.removeAttr('aria-hidden');

            // reset the wrapper
            $wrapper.removeClass(options.classMobileOpen);

            if (inst._animationFrame) {
                // if the nav is opening, stop it
                clearTimeout(inst._animationFrame);
            }
            
            function end() {
                // reset the nav to it default state, with all child menus closed
                $mobile.hide();
                inst._closeAllMenuItems({ relatedTarget: $toggle[0], type: 'nav-widget-close' });
                $mobile.find('[tabindex="0"]').attr('tabindex', '-1');

                if (window.innerWidth < options.breakpoint) {
                    $toggle.focus();
                } else {

                }
            }

            inst._animationFrame = setTimeout(function () {
                options.animateCloseMobile(end);
            }, options.animationTime);
        },
        _openNavMobileSplit: function () {
            // this function applies attributes and styling needed to open the mobile nav
            var inst = this;
            var options = inst.options;
            var $wrapper = $(options.destWrapper); // the root page element
            var $toggle = $(options.destMobileToggleSplit); // the button that toggles the menu state
            var $mobile = $(options.destMobileSplit); // the mobile nav
            var $childMenuItem = $mobile.find('> ul > li').first(); // the first item in the nav
            var selectorChildTarget = $childMenuItem.hasClass('has-innerMenu') ? ' > button' : ' > a'; // the menu item can be a link or a button
            var $childTarget = $childMenuItem.find(selectorChildTarget); // the menu item
            var $content = $('.layout_inner') //content of the page excluding the mobile nav

            // apply aria attrs to indicate the current state of the mobile nav
            $toggle.attr({
                'aria-label': 'Click to close mobile invester relations menu',
                'aria-expanded': 'true',
            });

            if (inst._animationFrameSplit) {
                // if the nav is closing, stop it
                clearTimeout(inst._animationFrameSplit);
            }
            
            // the mobile nav is hidden by default, so we need to show it before interacting with it
            $mobile.show();
            $childTarget.focus();
            $childTarget.attr('tabindex', '0');

            // hiding page contents from screenreader
            $content.attr('aria-hidden', 'true');

            inst._animationFrameSplit = setTimeout(function () {
                // trigger the menu opening
                window.requestAnimationFrame(function () {
                    $wrapper.addClass(options.classMobileOpenSplit);
                    options.animateOpenMobileSplit();
                });
            }, 1);
        },
        _closeNavMobileSplit: function (ev) {
            // this function applies attributes and styling needed to close the mobile nav
            var inst = this;
            var options = inst.options;
            var $wrapper = $(options.destWrapper); // the root page element
            var $toggle = $(options.destMobileToggleSplit); // the button that toggles the menu state
            var $mobile = $(options.destMobileSplit); // the mobile nav
            var $content = $('.layout_inner') //content of the page excluding the mobile nav

            // apply aria attrs to indicate the current state of the mobile nav
            $toggle.attr({
                'aria-label': 'Click to open mobile menu',
                'aria-expanded': 'false',
            });

            // unhide page content when mobile nav closes
            $content.removeAttr('aria-hidden');

            // reset the wrapper
            $wrapper.removeClass(options.classMobileOpenSplit);

            if (inst._animationFrameSplit) {
                // if the nav is opening, stop it
                clearTimeout(inst._animationFrameSplit);
            }
            
            function end() {
                // reset the nav to it default state, with all child menus closed
                $mobile.hide();
                $mobile.find('[tabindex="0"]').attr('tabindex', '-1');

                if (window.innerWidth < options.breakpoint) {
                    $toggle.focus();
                }
            }

            function close() {
                options.animateCloseMobileSplit(end);
            }

            switch (options.menuFxMobile) {
                case 'slide-down':
                    inst._animationFrameSplit = setTimeout(close, options.animationTime);
                    break;
                case 'pop':
                default:
                    close();
                    break;
            }
        },
        _buildTemplateMobile: function () {
            // this function builds the template for the top-level mobile nav
            var template, templateItem, icon;
            var inst = this;
            var options = inst.options;
            var type = options.classMobile + (options.styleMobile ? '--' + options.styleMobile : '') + '--topMenu';
            var searchWrapper = options.classMobile +'--search_container';
            var closeToggleTpl = $(options.destMobileToggle).prop('outerHTML');
            var $searchForm = $('<form id="'+ options.searchFormIdMobile +'" action="/search-results" method="post"></form>');
            var searchInputId = 'navMobileSearchInput';
            var searchbar = (
                    '<div class="'+ searchWrapper +'">' +
                        '<label id="navMobileSearchText" class="module-search_text sr-only" for="'+ searchInputId +'">Search query</label>' +
                        '<input id="'+ searchInputId +'" class="'+ options.destSearchMobile.replace('.', '') +'" name="SearchTerm" form="'+ options.searchFormIdMobile +'" type="text" maxlength="256" title="Search query" placeholder="Search">' +
                        '<button id="navMobileSearchBtn" class="'+ searchWrapper +'--btn" aria-label="search" form="'+ options.searchFormIdMobile +'" type="submit"><span class="button_text q4-icon_search" aria-hidden="true"></span></button>' +
                    '</div>'
                );

            function updateSearchAction() {
                var searchValue = $('#' + searchInputId).val();

                $searchForm.attr('action', '/search-results?SearchTerm='+searchValue);
            };

            if (options.includeSearchMobile) {
                $('body').append($searchForm);
                $('#' + options.searchFormIdMobile).on('submit', updateSearchAction);
            }

            if (options.includechildrenMobile) {

                switch (options.styleMobile) {
                    case 'panel':
                        icon = 'q4-icon_chevron-' + options.dirMobile;
                        break;
                    case 'expand':
                    default:
                        icon = 'q4-icon_chevron-down';
                        break;
                }

                templateItem = (
                    /* beautify preserve:start */
                    // @formatter:off
                    '<li class="'+ type +'--menuItem {{#hasChildren}}has-innerMenu{{/hasChildren}} {{expandedClass}} {{selectedClass}}" role="none">' +
                        '{{^hasChildren}}' +
                            '<a class="link" target="{{target}}" href="{{href}}" role="menuitem" tabindex="{{tabindex}}" {{#selected}}aria-current="page"{{/selected}}>' +
                                '<span class="text">{{{text}}}</span>' +    
                            '</a>' +
                        '{{/hasChildren}}' +
                        '{{#hasChildren}}' +
                            '<button id="button--{{menuId}}-mobile" class="button" type="button" aria-controls="{{menuId}}-mobile" aria-role="menuitem" aria-expanded="false" tabindex="{{tabindex}}">' +
                                '<span class="text">{{{text}}}</span>' +
                                '<span class="icon '+ icon +'" aria-hidden="true"></span>' +
                            '</button>' +
                            '{{#hasChildren}}{{>innerMenu}}{{/hasChildren}}' +
                        '{{/hasChildren}}' +
                    '</li>'
                    // @formatter:on
                    /* beautify preserve:end */
                );
            } else {
                templateItem = (
                    /* beautify preserve:start */
                    // @formatter:off
                    '<li class="'+ type +'--menuItem {{expandedClass}} {{selectedClass}}" role="none">' +
                        '<a class="link" target="{{target}}" href="{{href}}" role="menuitem" tabindex="{{tabindex}}" {{#selected}}aria-current="page"{{/selected}}>' +
                            '<span class="text">{{{text}}}</span>' +    
                        '</a>' +
                    '</li>'
                    // @formatter:on
                    /* beautify preserve:end */
                );
            }

            template = (
                /* beautify preserve:start */
                // @formatter:off
                '<div class="' + options.classMobile + '--inner_toggle_container">' +
                    closeToggleTpl +
                '</div>' +
                (options.includeSearchMobile && options.dirSearchMobile === 'top' ? searchbar : '') +
                '<ul role="menu" class="'+ type +' level0">' +
                    '{{#.}}' +
                        templateItem +
                    '{{/.}}' +
                '</ul>' +
                (options.includeSearchMobile && options.dirSearchMobile === 'bottom' ? searchbar : '')
                // @formatter:on
                /* beautify preserve:end */
            );

            return template;
        },
        _buildTemplateMobileSplit: function () {
            // this function builds the template for the top-level mobile nav
            var template, templateItem, icon;
            var inst = this;
            var options = inst.options;
            var type = options.classMobile + (options.styleMobileSplit ? '--' + options.styleMobileSplit : '') + '--topMenu';
            
            switch (options.styleMobileSplit) {
                case 'expand':
                default:
                    icon = 'q4-icon_chevron-down';
                    break;
            }

            templateItem = (
                /* beautify preserve:start */
                // @formatter:off
                '<li class="'+ type +'--menuItem {{#hasChildren}}has-innerMenu{{/hasChildren}} {{expandedClass}} {{selectedClass}}" role="none">' +
                    '{{^hasChildren}}' +
                        '<a class="link" target="{{target}}" href="{{href}}" role="menuitem" tabindex="{{tabindex}}" {{#selected}}aria-current="page"{{/selected}}>' +
                            '<span class="text">{{{text}}}</span>' +    
                        '</a>' +
                    '{{/hasChildren}}' +
                    '{{#hasChildren}}' +
                        '<button id="button--{{menuId}}-mobile" class="button" type="button" aria-controls="{{menuId}}-mobile" aria-role="menuitem" aria-haspopup="true" aria-expanded="false" tabindex="{{tabindex}}">' +
                            '<span class="text">{{{text}}}</span>' +
                            '<span class="icon '+ icon +'" aria-hidden="true"></span>' +
                        '</button>' +
                        '{{#hasChildren}}{{>innerMenu}}{{/hasChildren}}' +
                    '{{/hasChildren}}' +
                '</li>'
                // @formatter:on
                /* beautify preserve:end */
            );

            template = (
                /* beautify preserve:start */
                // @formatter:off
                '<ul class="'+ type +' level0">' +
                    '{{#.}}' +
                        templateItem +
                    '{{/.}}' +
                '</ul>'
                // @formatter:on
                /* beautify preserve:end */
            );

            return template;
        },
        _buildTemplateMobileInner: function () {
            // this function builds the template for child menus of the mobile nav
            var template, templateItems;
            var inst = this;
            var options = inst.options;
            var type = options.classMobile + (options.styleMobile ? '--' + options.styleMobile : '') + '--innerMenu';

            switch (options.styleMobile) {
                case 'panel':
                    var icon = 'q4-icon_chevron-' + options.dirMobile;

                    templateItems = (
                        /* beautify preserve:start */
                        // @formatter:off
                            '<li class="'+ type +'--menuItem panel-control" role="none">' +
                                '<button id="button--{{menuId}}-mobile--close" class="button" type="button" aria-label="Click to go back to previous navigation level" aria-controls="{{menuId}}-mobile" aria-role="menuitem" aria-haspopup="true" aria-expanded="false" tabindex="-1">' +
                                    '<span class="icon q4-icon_chevron-left" aria-hidden="true"></span>' +
                                    '<span class="text">' + inst.options.backButtonLabel + '</span>' +
                                '</button>' +
                            '</li>' +
                            '{{#children}}' +
                                '<li class="'+ type +'--menuItem {{#hasChildren}}has-innerMenu{{/hasChildren}} {{expandedClass}} {{selectedClass}}" role="none">' +
                                    '{{^hasChildren}}' +
                                        '<a class="link" target="{{target}}" href="{{href}}" role="menuitem" tabindex="-1" {{#selected}}aria-current="page"{{/selected}}>' +
                                            '<span class="text">{{{text}}}</span>' +    
                                        '</a>' +
                                    '{{/hasChildren}}' +
                                    '{{#hasChildren}}' +
                                        '<button id="button--{{menuId}}-mobile" class="button" type="button" aria-controls="{{menuId}}-mobile" aria-role="menuitem" aria-haspopup="true" aria-expanded="false" tabindex="-1">' +
                                            '<span class="text">{{{text}}}</span>' +
                                            '<span class="icon '+ icon +'" aria-hidden="true"></span>' +
                                        '</button>' +
                                        '{{#hasChildren}}{{>innerMenu}}{{/hasChildren}}' +
                                    '{{/hasChildren}}' +
                                '</li>' +
                            '{{/children}}'
                        // @formatter:on
                        /* beautify preserve:end */
                    );
                    break;
                case 'expand':
                default:
                    templateItems = (
                        /* beautify preserve:start */
                        // @formatter:off
                            '{{#children}}' +
                                '<li class="'+ type +'--menuItem {{#hasChildren}}has-innerMenu{{/hasChildren}} {{expandedClass}} {{selectedClass}}" role="none">' +
                                    '{{^hasChildren}}' +
                                        '<a class="link" target="{{target}}" href="{{href}}" role="menuitem" tabindex="-1" {{#selected}}aria-current="page"{{/selected}}>' +
                                            '<span class="text">{{{text}}}</span>' +    
                                        '</a>' +
                                    '{{/hasChildren}}' +
                                    '{{#hasChildren}}' +
                                        '<button id="button--{{menuId}}-mobile" class="button" type="button" aria-controls="{{menuId}}-mobile" aria-role="menuitem" aria-haspopup="true" aria-expanded="false" tabindex="-1">' +
                                            '<span class="text">{{{text}}}</span>' +
                                            '<span class="icon q4-icon_chevron-down" aria-hidden="true"></span>' +
                                        '</button>' +
                                        '{{#hasChildren}}{{>innerMenu}}{{/hasChildren}}' +
                                    '{{/hasChildren}}' +
                                '</li>' +
                            '{{/children}}'
                        // @formatter:on
                        /* beautify preserve:end */
                    );
                    break;
            }

            template = (
                /* beautify preserve:start */
                // @formatter:off
                    '<ul id="{{menuId}}-mobile" class="{{level}} '+ type +' '+ (!options.splitMobile ? options.dirMobile : '') +'" role="menu" aria-labelledby="button--{{menuId}}-mobile" tabindex="-1">' +
                        templateItems +
                    '</ul>'
                // @formatter:on
                /* beautify preserve:end */
            );

            return template;
        },
        _renderMobileSplit: function (templates) {
            var inst = this;
            var options = inst.options;
            var idMobileMenuSplit = 'nav--mobile-menu--split';
            var $mobile = $(options.destMobileSplit);
            var $toggle = $(options.destMobileToggleSplit);

            $mobile.hide();
            $mobile.attr('id', idMobileMenuSplit);
            $mobile.addClass('nav--split');
            $mobile.addClass(options.dirDesktopSplit);
            $mobile.html(
                Mustache.render(
                    templates.split,
                    options.dataSplitMobile,
                    {
                        "innerMenu": templates.inner
                    }
                )
            );

            $toggle.attr({
                'aria-label': 'Click to open mobile investor resaltions menu',
                'aria-expanded': 'false',
                'aria-controls': idMobileMenuSplit
            });

            $toggle.on('click', function (ev) {
                stopEvent(ev);
                
                if ($toggle.attr('aria-expanded') === 'false') {
                    inst._openNavMobileSplit(ev);
                } else {
                    inst._closeNavMobileSplit(ev);
                }
            });
        },
        _renderMobile: function () {
            // this function renders the mobile nav and adds event handling
            var inst = this;
            var options = inst.options;
            var $wrapper = $(options.destWrapper);
            var idMobileMenu = 'nav--mobile-menu';
            var $mobile = $('<nav id="'+idMobileMenu+'" class="'+ options.classMobile +' '+ options.dirMobile +'"></nav>');
            var animationTime = options.animationTime / 1000;
            var templates = {
                    top: inst._buildTemplateMobile(),
                    inner: inst._buildTemplateMobileInner()
                };

            if (options.splitMobile) {
                templates.split = inst._buildTemplateMobileSplit();
            }

            $mobile.css({
                'transition': 'transform '+ animationTime +'s ease-in-out'
            });

            $wrapper.prepend($mobile);
            $mobile.hide();

            options.beforeRender({
                type: 'render-template-mobile',
                templates: templates
            });
            options.beforeRenderMobile(templates);

            $mobile.html(
                Mustache.render(
                    templates.top,
                    options.data,
                    {
                        "innerMenu": templates.inner
                    }
                )
            );

            $(options.destMobile + '--panel--innerMenu').css({
                'transition': 'transform '+ animationTime +'s ease-in-out'
            });

            var $toggle = $(options.destMobileToggle);

            $toggle.addClass(options.dirMobile);
            $toggle.attr({
                'aria-label': 'Click to open mobile menu',
                'aria-expanded': 'false',
                'aria-controls': idMobileMenu
            });

            $toggle.on('click', function (ev) {
                stopEvent(ev);

                if ($(this).attr('aria-expanded') === 'false') {
                    inst._openNavMobile(ev);
                } else {
                    inst._closeNavMobile(ev);
                }
            });

            $toggle.on('keydown', function (ev) {

                if (ev.keyCode !== KEYCODES.TAB || !$wrapper.hasClass(options.classMobileOpen)) {
                    return null;
                }

                stopEvent(ev);
                var itemSelector = options.destMobile + (options.styleMobile ? '--' + options.styleMobile : '') + '--topMenu [tabindex="0"]';
                var $menuItem = $(itemSelector);

                if (!options.includeSearchMobile) {
                    $menuItem.focus();
                } else {
                    var $target = $(ev.target);
                    var $searchInput = $(options.destSearchMobile);
                    var $searchBtn = $(options.destSearchMobile.replace('input', 'btn'));
                    var $tabElem = inst._getNextTabElementMobile(ev, $target, $toggle, $searchInput, $searchBtn, $menuItem);

                    $tabElem.focus();
                }
            });

            function submitSearch(ev) {
                
                if (ev.keyCode === KEYCODES.RETURN) {
                    $('#' + options.searchFormIdMobile).submit();
                }
            }

            if (options.includeSearchMobile) {
                $(options.destSearchMobile).on('keydown', submitSearch);
                $(options.destSearchMobile.replace('input', 'btn')).on('keydown click', submitSearch);
            }
            
            if (options.splitMobile) {
                inst._renderMobileSplit(templates);
            }

            $(window).resize(function (ev) {
                if ((options.hasDesktopMenu && $(options.destDesktop).is(':visible')) || (!options.hasDesktopMenu && window.innerWidth > options.breakpoint)) {
                    inst._closeNavMobile(ev);
                    inst._closeNavMobileSplit(ev);
                }
            });
        },
        _getMoveSelector: function ($elem) {
            // this determines the selector to get the next/prev element when moving between items using the keyboard
            return $elem.hasClass('has-innerMenu') || $elem.hasClass('panel-control') ? ' > button' : ' > a';
        },
        _moveMenuItem: function ($target, $next, $prev, dir) {
            // this applies focus to the next/prev element when moving between items using the keyboard
            // $target is the current item content element
            // $next is the item to the right or below the current
            // $prev is the itme to the left or above the current
            // dir is the direction of the movement: 1 (next), -1 (prev)
            var $move;
            var inst = this;
            var options = inst.options;
            var isMobile = $target.closest(options.destMobile).length || $target.closest(options.destMobileSplit).length;

            $target.blur();
            if (isMobile) {
                $target.attr('tabindex', '-1');
            }

            switch (dir) {
                case 1:
                    $move = $next.find(inst._getMoveSelector($next));
                    break;
                case -1:
                    $move = $prev.find(inst._getMoveSelector($prev));
                    break;
            }
            
            $move.focus();
            if (isMobile) {
                $move.attr('tabindex', '0');
            }
        },
        _moveStepMenuItem: function ($menuItem, $menu, $target, dir) {
            // this gets the next and prev menu items when move right,up or left,down
                // moving to the prev from the first item will go to the last
                // moving to the next from the last item will go to the first
            // $menuItem is the current item
            // $menu is the menu of which the current item lives
            // $target is the current item content element
            // dir is the direction of the movement: 1 (last), -1 (first)
            var inst = this;
            var $nextSibling = $($menuItem[0].nextSibling);
            var $prevSibling = $($menuItem[0].previousSibling);
            var $menuItems = $menu.find(' > li');

            //if there are no menu items, then arrow keys will do nothing
            if ($menuItems.length){
                if (!$nextSibling[0]) {
                    $nextSibling = $menuItems.first();
                }
    
                if (!$prevSibling[0]) {
                    $prevSibling = $menuItems.last();
                }
                
                inst._moveMenuItem($target, $nextSibling, $prevSibling, dir);
            }

        },
        _moveEndMenuItem: function ($menuItem, $menu, $target, dir) {
            // this applies focus to either the first or last element in a menu
            // $menuItem is the current item
            // $menu is the menu of which the current itme lives
            // $target is the current item content element
            // dir is the direction of the movement: 1 (last), -1 (first)
            var inst = this;
            var $menuItems = $menu.find(' > li');
            var $firstSibling = $menuItems.first();
            var $lastSibling = $menuItems.last();

            inst._moveMenuItem($target, $lastSibling, $firstSibling, dir);
        },
        _openMenuItem: function ($menuItem, $target) {
            var inst = this;
            var options = inst.options;
            var isMobile = $target.closest(options.destMobile).length || $target.closest(options.destMobileSplit).length;
            // if the current menu item has a child menu, this opens it and brings focus to the first child menu item
            if (!$menuItem.hasClass('has-innerMenu')) {
                return;
            }
            
            var $childMenuItem = $menuItem.find('> ul > li').first();
            var selectorChildTarget = $childMenuItem.hasClass('has-innerMenu') || $childMenuItem.hasClass('panel-control') ? ' > button' : ' > a';
            var $childTarget = $childMenuItem.find(selectorChildTarget);

            $target.navMenu('open', { relatedTarget: $target[0], type: 'keyboard-open-menu-item' });
            if (isMobile) {
                $target.attr('tabindex', '-1');
                $childTarget.attr('tabindex', '0');
            }
            $childTarget.focus();
        },
        _closeMenuItem: function ($menuItem, $menu, $target) {
            // this closes a child menu and brings focus back to the menu item
            var inst = this;
            var options = inst.options;
            var isMobile = $target.closest(options.destMobile).length || $target.closest(options.destMobileSplit).length;
            var $parentMenuItem = $menu.parent();

            if (!$parentMenuItem.hasClass('has-innerMenu')) {
                return;
            }

            var $parentTarget = $parentMenuItem.find(' > button');
            
            $parentTarget.navMenu('close', { relatedTarget: null, type: 'keyboard-close-menu-item' });
            if (isMobile) {
                $target.attr('tabindex', '-1');
                $parentTarget.attr('tabindex', '0');
            }
            $parentTarget.focus();
        },
        _closeAllMenuItems: function (ev) {
            // this closes all open menus

            var $menu;
            var $activeMenus = $('.has-innerMenu button[aria-expanded="true"]');
            var target = ev.relatedTarget;

            $.each($activeMenus, function (idx, elem) {
                $menu = $(elem);
                $menu.navMenu('close', { relatedTarget: target, type: 'keyboard-close-all-menu-item' });
            });
        },
        _handleMouseExit: true, // a flag to detemine whether or not to allow a mosue event to close a menu
        _handleKeyboardInputHoz: function (ev, $menuItem, $menu, $target) {
            // this handles keyboard events for when the desktop nav is in hoz mode
            // keyboard controls vary on whether the focus is at the top-level or within a child menu
            var inst = this;
            
            inst._handleMouseExit = false; // when controlling via keyboard, turn off the mouse close handler

            switch (ev.keyCode) {
                case KEYCODES.RIGHT:
                    
                    if ($menu.hasClass('level0')) {
                        inst._moveStepMenuItem($menuItem, $menu, $target, 1);
                    } else {
                        inst._openMenuItem($menuItem, $target);
                    }
                    break;
                case KEYCODES.LEFT:

                    if ($menu.hasClass('level0')) {
                        inst._moveStepMenuItem($menuItem, $menu, $target, -1);
                    } else {
                        inst._closeMenuItem($menuItem, $menu, $target);
                    }
                    break;
                case KEYCODES.UP:

                    if ($menu.hasClass('level0')) {
                        inst._closeMenuItem($menuItem, $menu, $target);
                    } else {
                        inst._moveStepMenuItem($menuItem, $menu, $target, -1);
                    }
                    break;
                case KEYCODES.DOWN:
                    
                    if ($menu.hasClass('level0')) {
                        inst._openMenuItem($menuItem, $target);
                    } else {
                        inst._moveStepMenuItem($menuItem, $menu, $target, 1);
                    }
                    break;
                case KEYCODES.ESC:

                    if (!$menu.hasClass('level0')) {
                        inst._closeMenuItem($menuItem, $menu, $target);
                    }
                    break;
                case KEYCODES.SPACE:
                case KEYCODES.RETURN:
                    inst._openMenuItem($menuItem, $target);
                    break;
                case KEYCODES.HOME:
                case KEYCODES.PAGEUP:
                    inst._moveEndMenuItem($menuItem, $menu, $target, -1);
                    break;
                case KEYCODES.END:
                case KEYCODES.PAGEDOWN:
                    inst._moveEndMenuItem($menuItem, $menu, $target, 1);
                    break;
            }
        },
        _getNextTabElementMobile: function (ev, $target, $toggle, $searchInput, $searchBtn, $menuItem) {
            var inst = this;
            var options = inst.options;
            var searchDir = options.dirSearchMobile;
            var isSearchInput = isNodesRelated($target[0], $searchInput[0]);
            var isSearchBtn = isNodesRelated($target[0], $searchBtn[0]);
            var isMenuItem = isNodesRelated($target[0], $menuItem[0]);
            var isToggle = isNodesRelated($target[0], $toggle[0]);

            function getOrderSearchTop() {
                // if the shiftkey is pressed, go to previous item else go to next item

                if (isSearchInput) {
                    return ev.shiftKey ? $toggle : $searchBtn;
                } else if (isSearchBtn) {
                    return ev.shiftKey ? $searchInput : $menuItem;
                } else if (isMenuItem) {
                    return ev.shiftKey ? $searchBtn : $toggle;
                } else if (isToggle) {
                    return ev.shiftKey ? $menuItem : $searchInput;
                } else {
                    return $toggle;
                }
            }

            function getOrderSearchBottom() {
                // if the shiftkey is pressed, go to previous item else go to next item
                    
                if (isSearchInput) {
                    return ev.shiftKey ? $menuItem : $searchBtn;
                } else if (isSearchBtn) {
                    return ev.shiftKey ? $searchInput : $toggle;
                } else if (isMenuItem) {
                    return ev.shiftKey ? $toggle : $searchInput;
                } else if (isToggle) {
                    return ev.shiftKey ? $searchBtn : $menuItem;
                }
            }
            
            switch (searchDir) {
                case 'top':
                    return getOrderSearchTop();
                case 'bottom':
                    return getOrderSearchBottom();
            }
        },
        _handleKeyboardInputMobile: function (ev, $menuItem, $menu, $target, $nav) {
            // this handles keyboard events for the mobile menu
            var inst = this;
            var options = inst.options;
            var searchWrapper = '.' + options.classMobile +'--search_container';

            if (    
                    options.includeSearchMobile &&
                    ev.keyCode !== KEYCODES.TAB &&
                    isNodesRelated($(searchWrapper)[0], $target[0])
                ) {
                return true;
            }

            switch (ev.keyCode) {
                case KEYCODES.LEFT:
                case KEYCODES.UP:
                    inst._moveStepMenuItem($menuItem, $menu, $target, -1);
                    break;
                case KEYCODES.RIGHT:
                case KEYCODES.DOWN:
                    inst._moveStepMenuItem($menuItem, $menu, $target, 1);
                    break;
                case KEYCODES.ESC:
                    
                    if (!$menu.hasClass('level0')) {
                        inst._closeMenuItem($menuItem, $menu, $target);
                    } else {
                        
                        if (options.splitMobile && $menu.parent().hasClass('nav--split')) {
                            inst._closeNavMobileSplit(ev);
                        } else {
                            inst._closeNavMobile(ev);
                        }
                    }
                    
                    break;
                case KEYCODES.SPACE:
                case KEYCODES.RETURN:

                    if ($menuItem.hasClass('panel-control')) {
                        // if this is the back button close the child menu
                        inst._closeMenuItem($menuItem, $menu, $target);
                    } else {
                        inst._openMenuItem($menuItem, $target);
                    }

                    break;
                case KEYCODES.HOME:
                case KEYCODES.PAGEUP:
                    inst._moveEndMenuItem($menuItem, $menu, $target, -1);
                    break;
                case KEYCODES.END:
                case KEYCODES.PAGEDOWN:
                    inst._moveEndMenuItem($menuItem, $menu, $target, 1);
                    break;
                case KEYCODES.TAB:
                    // when the mobile menu is open, we need to cycle between the toggle/search/nav
                    var $tabElem;
                    var $toggle = $nav.find(options.destMobileToggle);
                    var $searchInput = $(options.destSearchMobile);
                    var $searchBtn = $(options.destSearchMobile.replace('input', 'btn'));
                    var $menuItem = $(options.destMobile + '--' + (options.styleMobile ? options.styleMobile +'--topMenu' : 'topMenu') + ' [tabindex="0"]');
                    
                    if (!options.includeSearchMobile) {
                        $tabElem = $toggle;
                    } else {
                        $tabElem = inst._getNextTabElementMobile(ev, $target, $toggle, $searchInput, $searchBtn, $menuItem);
                    }
                    $tabElem.focus();
                    break;
            }
        },
        _addSearchFocusTooltip: function ($tooltip, $search) {
            var focusElementPadding = 10;
            var leftPosition = 0;
            var dataPosition = 'right';
            var searchBox = {
                    left: $search[0].offsetLeft,
                    width: $search[0].offsetWidth,
                    right: $search[0].offsetRight,
                    height: $search.outerHeight(),
                    top: $search.position().top,
                };

            if ($(window).width() > searchBox.left + searchBox.width + 200) {
                leftPosition = searchBox.left + searchBox.width - focusElementPadding;
            } else {
                dataPosition = 'left';
                leftPosition = searchBox.left + focusElementPadding;
            }

            $tooltip.attr({
                'aria-hidden': 'false',
                'data-position': dataPosition
            }).css({
                top: searchBox.top + searchBox.height / 2,
                left: leftPosition
            });
            
        },
        _removeSearchFocusTooltip: function ($tooltip) {
            var inst = this;
            var options = inst.options;

            $tooltip.attr('aria-hidden', 'true').removeAttr('style');
        },
        _searchFocusToolTip: function(tooltipId) {
            var inst = this;
            var options = inst.options;
            var tooltipLabel = options.searchTooltipLabel;
            var $tooltip = $('<span id="' + tooltipId + '" class="tooltip" role="tooltip" aria-hidden="true" aria-label="' + tooltipLabel + '">'+ tooltipLabel +'</span>');
            var $search = $(options.destDesktop + '--search_container');
            var searchId = '#navDesktopSearch';
            var $searchBtn = $(searchId + 'Btn');

            $search.attr('aria-describedby', tooltipId).after($tooltip);

            function focusTooltip() {
                inst._addSearchFocusTooltip($tooltip, $search);
            }

            function removeTooltip() {
                inst._removeSearchFocusTooltip($tooltip);
            }
            
            $searchBtn.mouseenter(focusTooltip);
            $search.focusin(focusTooltip);
            $searchBtn.mouseleave(removeTooltip);
            $search.focusout(removeTooltip);

        },
        _addAccessibilityDesktop: function () {
            // this applies the navMenu widget each of the menu items that have a child menu
            // this applies mouse and keyboard event handlers for the desktop nav
            var $splitDesktop;
            var inst = this;
            var options = inst.options;
            var $desktop = $(options.destDesktop);

            function attachNavMenus(idx, menuController) {
                $(menuController).navMenu({
                    style: options.styleDesktop,
                    animationTime: options.animationTime,
                    isSplit: options.splitDesktop,
                    fx: options.menuFxDesktop,
                    navWrapper: options.destDesktop,
                    isMobile: false
                });
            } 

            function applyAccessibility($nav) {
                var $menuControllers = $nav.find('li.has-innerMenu button');
                
                if ($menuControllers.length) {
                    $.each($menuControllers, attachNavMenus);
                }

                $nav.on('mouseleave', function (ev) {

                    if (inst._handleMouseExit) {
                        inst._closeAllMenuItems(ev);
                    } else {
                        inst._handleMouseExit = true;
                    }
                });
    
                $nav.on('keydown', function (ev) {
                    var $target = $(ev.target);
                    var $menuItem = $target.parent();
                    var $menu = $target.parent().parent();
                    
                    if (
                            (CODEKEYS.indexOf(ev.keyCode) === -1) ||
                            (ev.keyCode === KEYCODES.RETURN && ev.target.nodeName === 'A') ||
                            (ev.target.nodeName === 'INPUT')
                        )
                        {
                        // only handle the keys we want, dont process menu items that are just links, disable nav keyboard controls when in search input
                        return null;
                    }
    
                    if (ev.keyCode !== KEYCODES.TAB) {
                        stopEvent(ev);
    
                        switch (options.dirDesktop) {
                            case 'hoz':
                                inst._handleKeyboardInputHoz(ev, $menuItem, $menu, $target);
                                break;
                        }
                    }
                });
            }

            applyAccessibility($desktop);

            if (options.splitDesktop) {
                $splitDesktop = $(options.destDesktopSplit);
                applyAccessibility($splitDesktop);
            }

            $(document).on('click mousemove', function (ev) {
                var $wrapper = $(options.destWrapper);
                
                if ($wrapper.hasClass(options.classMobileOpen) || $wrapper.hasClass(options.classMobileOpenSplit)) {
                    return null;
                }

                if (
                    !isNodesRelated((ev.target || ev.toElement), $desktop[0]) &&
                    (
                        options.splitDesktop &&
                        !isNodesRelated((ev.target || ev.toElement), $splitDesktop[0])
                    )
                ) {
                    inst._closeAllMenuItems(ev);
                    inst._handleMouseExit = true;
                }
            });

            //Accessibility - for desktop search tooltip
            if (options.includeSearchDesktop) {
                inst._searchFocusToolTip(options.idSearchTooltip);
            }

            if (options.includeSearchDesktopSecondary) {
                inst._searchFocusToolTip(options.idSearchTooltipSecondary);
            }
        },
        _addAccessibilityMobile: function () {
            // this applies the navMenu widget each of the menu items that have a child menu
            // this applies keyboard event handlers for the mobile nav
            var $splitMobile;
            var inst = this;
            var options = inst.options;
            var $mobile = $(options.destMobile);

            function attachNavMenus(idx, menuController) {
                $(menuController).navMenu({
                    type: 'mobile',
                    animationTime: options.animationTime,
                    style: (options.splitMobile ? options.styleMobileSplit : options.styleMobile),
                    isSplit: options.splitMobile,
                    fx: options.menuFxMobile,
                    navWrapper: options.destMobile,
                    isMobile: true
                });
            } 

            function applyAccessibility($nav) {
                var $menuControllers = $nav.find('li.has-innerMenu button');
                
                if ($menuControllers.length) {
                    $.each($menuControllers, attachNavMenus);
                }

                $nav.on('keydown', function (ev) {
                    var $target = $(ev.target);
                    var $menuItem = $target.parent();
                    var $menu = $target.parent().parent();
    
                    if (
                        (CODEKEYS.indexOf(ev.keyCode) === -1) ||
                        (ev.keyCode === KEYCODES.RETURN && ev.target.nodeName === 'A') ||
                        (ev.keyCode === KEYCODES.RETURN && $(ev.target).is(options.destMobileToggle)) ||
                        (ev.target.nodeName === 'INPUT'))
                        {
                        // only handle the keys we want and dont process menu items that are just links or inputs
                        return null;
                    }
    
                    var processEvent = inst._handleKeyboardInputMobile(ev, $menuItem, $menu, $target, $nav);
    
                    if (!processEvent) {
                        stopEvent(ev);
                    }
                });
            }

            applyAccessibility($mobile);

            if (options.splitMobile) {
                $splitMobile = $(options.destMobileSplit);
                applyAccessibility($splitMobile);
            }
        },
        _addAccessibility: function () {
            // this enables accessibility for the navs
            var inst = this;
            var options = inst.options;

            if (options.hasDesktopMenu) {
                inst._addAccessibilityDesktop();
            }

            if (options.hasMobileMenu) {
                inst._addAccessibilityMobile();
            }
        },
        _complete: function () {
            var inst = this;
            var options = inst.options;
        },
        _create: function () {
            // this get the nav elements, processes them, renders the navs, and then applies accessibility
            var inst = this;
            var options = inst.options;

            if (!inst.element) {
                return;
            }

            var $homeItem = $(inst.element.find('ul.level1 li.home'));
            var $homeLink = $($homeItem.find(' > a')[0].cloneNode(true));
            var $topLinks = $(inst.element.find('ul.level2')[0].cloneNode(true));

            options.rootLink = {
                isSelected: $homeItem.hasClass('selected'),
                href: $homeLink.attr('href')
            };

            // this is to flatten the nav as the CMS page management uses the home page as the root parent element

            if (options.includeRootElement) {
                $topLinks.prepend(
                    '<li class="'+ (options.rootLink.isSelected ? 'selected' : '') +'"">' +
                        $homeLink[0].outerHTML +
                    '</li>'
                );
            }
            
            options.beforeExtractData($topLinks);
            options.data = inst._extractData($topLinks.find(' > li'));
            options.afterExtractData(options.data);
            options.classDesktop = options.destDesktop.replace('.', '');
            options.destSearchDesktop = options.destDesktop + '--search_container';
            options.classSearchDesktop = options.destSearchDesktop.replace('.', '');
            options.classMobile = options.destMobile.replace('.', '');
            options.idSearchTooltip = options.destSearchTooltip.replace('#', '');
            options.idSearchTooltipSecondary = options.destSearchTooltipSecondary.replace('#', '');

            function getSplitItem(splitItemLookup) {
                var splitItem;

                for (var i = 0, ii = options.data.length; i < ii; i++) {

                    if (options.data[i].text.toLowerCase().indexOf(splitItemLookup.toLowerCase()) !== -1) {
                        splitItem = options.data[i].children;
                        break;
                    }
                }

                return splitItem;
            }

            if (options.splitDesktop) {
                options.dataSplitDesktop = getSplitItem(options.splitSourceDesktop);
            }

            if (options.splitMobile) {
                options.dataSplitMobile = getSplitItem(options.splitSourceMobile);
            }

            if (options.hasDesktopMenu) {
                inst._renderDesktop();
            }
            
            if (options.hasMobileMenu) {
                inst._renderMobile();
            }

            if (!options.hasDesktopMenu && !options.hasMobileMenu) {
                console.warn("Navigation has been disabled")
            }

            if (!options.includeSearchDesktop && !options.includeSearchMobile) {
                console.warn("Navigation search has been disabled")
            }
            
            inst._addAccessibility();
            inst._complete();
            options.onComplete();
        },
        destroy: function () {
            this.element.html('');
        },
        _setOption: function () {
            this._superApply(arguments);
        }
    });

})(jQuery)