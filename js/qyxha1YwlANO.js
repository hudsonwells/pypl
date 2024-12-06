(o=>{o.widget("evergreen.q4Api",{options:{url:"",useJSONP:!1,forcePublic:!1,languageId:null,limit:0,limitSort:0,skip:0,excludeSelection:!1,fetchAllYears:!1,showAllYears:!1,allYearsText:"All",startYear:null,forceStartYear:!1,isTimeZoneKey:{PT:"PST",MT:"MST",CT:"CST",ET:"EST",AT:"AST",GT:"GST",GMT:"GMT",BST:"GMT"},tags:[],titleLength:0,bodyLength:0,shortBodyLength:0,useMoment:!0,dateFormat:{date:"MM/DD/YYYY",time:"h:mm A"},sortAscending:!1,years:[],minYear:null,maxYear:null,minDate:null,maxDate:null,defaultThumb:"",append:!1,cssClass:null,loadingClass:null,loadingMessage:'<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading ...</span></p>',yearContainer:null,yearTemplate:null,yearTrigger:null,yearSelect:null,getYearFilter:!0,noYearsMessage:"",tagSelect:null,tagTrigger:null,activeClass:"evergreen--selected",itemContainer:null,itemTemplate:"",itemLoadingClass:null,itemLoadingMessage:null,itemNotFoundMessage:'<p><i class="q4-icon_warning-line"></i> No items found.</p>',template:"",onYearChange:function(e,t){},onTagChange:function(e,t){},beforeRender:function(e,t){},beforeRenderItems:function(e,t){},beforeRenderYears:function(e,t){},itemsComplete:function(e){},complete:function(e){}},reloadYears:function(){var i=this,s=this.options,r=this.element;i._getYears().done(function(e,t){var a={years:[]};e.length?(i.years=i._filterYears(e,t),s.showAllYears&&a.years.push({year:s.allYearsText,value:-1}),o.each(i.years,function(e,t){a.years.push({year:t,value:t})}),i.currentYear=a.years[0].value,o(s.yearContainer,r).empty().removeAttr("disabled"),o.each(a.years,function(e,t){o(s.yearContainer,r).append(Mustache.render(s.yearTemplate,t))}),i._updateYearControls(i.currentYear),i.reloadItems(),s.yearTrigger&&o(s.yearTrigger,r).each(function(e){var t=a.years[e].value;o(this).data("year",t),o(this).click(function(e){o(this).hasClass(s.activeClass)||i.setYear(t,e)})}),s.yearSelect&&o(s.yearSelect,r).off().change(function(e){i.setYear(o(this).val(),e)})):(o(s.yearContainer,r).empty(),o(s.yearContainer,r).append(s.noYearsMessage).attr("disabled","true"),o(s.itemContainer,r).html(s.itemNotFoundMessage||""))})},reloadItems:function(){var t=this,a=this.options,e=this.element;a.itemContainer&&a.itemTemplate?(e=o(a.itemContainer,e),a.itemLoadingClass&&e.addClass(a.itemLoadingClass),e.html(a.itemLoadingMessage||"")):(a.loadingClass&&this.$widget.addClass(a.loadingClass),this.$widget.html(a.loadingMessage||"")),this._fetchItems(this.currentYear).done(function(e){a.itemContainer&&a.itemTemplate?t._renderItems(e):t._renderWidget(e)})},setYear:function(e,t){var a=this.options,e=parseInt(e);-1==o.inArray(e,this.years)&&(e=a.showAllYears?-1:this.years[0]),this._trigger("onYearChange",t,{year:e}),t&&t.isDefaultPrevented()||(this.currentYear=e,this._updateYearControls(this.currentYear),this.reloadItems())},setTags:function(e,t,a){e=this._convertToArray(e),this._trigger("onTagChange",a,{tags:e}),a&&a.isDefaultPrevented()||(this.currentTags=e,this._updateTagControls(this.currentTags),t?this.reloadYears():this.reloadItems())},setShowFuture:function(){this._setOption("showPast",!1),this._setOption("showFuture",!0),this._reinit()},setShowPast:function(){this._setOption("showPast",!0),this._setOption("showFuture",!1),this._reinit()},$widget:null,years:null,items:null,currentYear:-1,currentTags:[],_usePublic:function(){return!!this.options.forcePublic||"function"!=typeof GetViewType||"0"!=GetViewType()},_setOption:function(e,t){this._super(e,t),this._normalizeOptions()},_convertToArray:function(e){return"string"==typeof e&&(e=o.trim(e).split(/[\s,|]+/)),o.isArray(e)?e:[]},_convertToDate:function(e){e=new Date(e);return"Invalid Date"==e.toString()?null:e},_normalizeOptions:function(){var e=this.options,t=(e.url=e.url.replace(/\/$/,""),e.years=this._convertToArray(e.years).sort(function(e,t){return t-e}),e.tags=this._convertToArray(e.tags),"string"==typeof e.startYear&&e.startYear.length&&(e.startYear=parseInt(e.startYear)),e.minDate=e.minDate?this._convertToDate(e.minDate):null,e.maxDate=e.maxDate?this._convertToDate(e.maxDate):null,null===e.itemLoadingClass&&(e.itemLoadingClass=e.loadingClass),null===e.itemLoadingMessage&&(e.itemLoadingMessage=e.loadingMessage),(new Date).getFullYear());e.showPast&&!e.showFuture?e.maxYear=Math.min(t,e.maxYear||t):e.showFuture&&!e.showPast&&(e.minYear=Math.max(t,e.minYear||t))},_init:function(){var a=this,e=this.options,t=this.element;if("egApi"==this.widgetName)throw new Error("Please use one of evergreen.q4Api's child widgets.");this.contentType=this.contentTypes[this.widgetName],this._normalizeOptions(),this.$widget=e.append?o("<div>").appendTo(t):t,e.cssClass&&this.$widget.addClass(e.cssClass),e.loadingClass&&this.$widget.addClass(e.loadingClass),e.template&&this.$widget.html(e.loadingMessage||""),e.itemTemplate||o(e.itemContainer,t).html(e.itemLoadingMessage||e.loadingMessage||""),this.currentTags=e.tags,this._getYears().done(function(e,t){a.years=a._filterYears(e,t),a.currentYear=a._getCurrentYear(a.years),void 0!==t?a._renderWidget(t):a._fetchItems(a.currentYear).done(function(e){a._renderWidget(e)})})},_reinit:function(){this._setOption("maxYear",null),this._setOption("minYear",null),this.years=null,this.currentYear=-1,this.currentTags=[],this.items=[],this._init()},_getYears:function(){var t,i=this,e=this.options;return e.getYearFilter&&!e.limit?(t=o.Deferred(),this._fetchItems(-1).done(function(e){var a=[];o.each(e,function(e,t){-1==o.inArray(t.year,a)&&a.push(t.year)}),i._trigger("beforeRenderYears",null,{items:a}),t.resolve(a,e)}),t):e.fetchAllYears&&!e.limit?(t=o.Deferred(),this._fetchItems(-1).done(function(e){var a=[];o.each(e,function(e,t){-1==o.inArray(t.year,a)&&a.push(t.year)}),t.resolve(a,e)}),t):this._fetchYears()},_filterYears:function(e,t){var a=this.options;return e=o.grep(e,function(e){return(!a.minYear||e>=a.minYear)&&(!a.maxYear||e<=a.maxYear)&&(!a.years.length||-1<o.inArray(e,a.years))}),e=0<a.numOfYears&&a.numOfYears<e.length?e.slice(0,a.numOfYears):e,a.forceStartYear&&-1==o.inArray(a.startYear,e)&&e.push(a.startYear),e.sort(function(e,t){return t-e}),e},_getCurrentYear:function(e){var t=this.options;if(e.length){if(-1<o.inArray(t.startYear,e))return t.startYear;if(!t.showAllYears)return e[0]}return-1},_buildParams:function(){var e=this.options;return this._usePublic()?{LanguageId:e.languageId||("function"==typeof GetLanguageId?GetLanguageId():1)}:{serviceDto:{ViewType:GetViewType(),ViewDate:GetViewDate(),RevisionNumber:GetRevisionNumber(),LanguageId:e.languageId||("function"==typeof GetLanguageId?GetLanguageId():1),Signature:GetSignature()}}},_callApi:function(e,t){var a=this.options;return this._usePublic()?o.ajax({type:"GET",url:a.url+e,data:t,contentType:"application/json; charset=utf-8",dataType:a.useJSONP?"jsonp":"json"}):o.ajax({type:"POST",url:e,data:JSON.stringify(t),contentType:"application/json; charset=utf-8",dataType:"json"})},_fetchYears:function(){var t=this,e=this.options,a=t._usePublic()?1:0,i=o.Deferred(),s=o.grep(this.currentTags||[],function(e){return 0<e.length}),s=t._usePublic()?{tagList:s.join("|")}:{serviceDto:{TagList:s}};return this._callApi(this.contentType.yearsUrl[a],o.extend(!0,this._buildParams(),this.contentType.buildParams.call(this,e),s)).done(function(e){t._trigger("beforeRenderYears",null,{items:e[t.contentType.yearsResultField]}),i.resolve(e[t.contentType.yearsResultField])}),i},_fetchItems:function(t){var i=this,s=this.options,e=i._usePublic()?1:0,r=o.Deferred(),a=o.grep(this.currentTags,function(e){return 0<e.length}),a=this._usePublic()?{pageSize:s.limit||-1,pageNumber:s.skip,tagList:a.join("|"),includeTags:!0,year:s.fetchAllYears?-1:t,excludeSelection:s.excludeSelection?0:1}:{serviceDto:{ItemCount:s.limit||-1,StartIndex:s.skip,TagList:a,IncludeTags:!0},excludeSelection:s.excludeSelection?0:1,year:s.fetchAllYears?-1:t};return this._callApi(this.contentType.itemsUrl[e],o.extend(!0,this._buildParams(),this.contentType.buildParams.call(this,s),a)).done(function(e){var a,e=o.map(e[i.contentType.itemsResultField],function(e){return i.contentType.parseItem.call(i,s,e)});(e=o.grep(e,function(e){return(!s.minDate||e.dateObj>=s.minDate)&&(!s.maxDate||e.dateObj<=s.maxDate)})).sort(function(e,t){return(t.dateObj-e.dateObj)*(s.sortAscending?-1:1)}),0<s.numOfYears&&-1==t&&((a=i.years||[]).length||(o.each(e,function(e,t){-1==o.inArray(t.year,a)&&a.push(t.year)}),s.numOfYears<a.length&&(a=a.slice(0,s.numOfYears))),e=o.grep(e,function(e){return!s.numOfYears||!a.length||-1<o.inArray(e.year,a)})),0!==s.docOrder&&void 0!==s.docOrder&&o.each(e,function(e,a){o.each(s.docOrder,function(e,t){o.grep(a.docs,function(e){return e.docType==t}).length||a.docs.push({docType:t,docUrl:"",docEmpty:!0})}),a.docs.sort(function(e,t){e=o.inArray(e.docType,s.docOrder),t=o.inArray(t.docType,s.docOrder);return e<t?-1:t<e?1:0})}),r.resolve(e)}),r},_truncate:function(e,t){return e?!t||e.length<=t?e:e.substring(0,t)+"...":""},_formatDate:function(e){var t=this.options,a=new Date(e),i=t.useMoment&&"undefined"!=typeof moment;if("string"==typeof t.dateFormat)return i?moment(a).format(t.dateFormat):o.datepicker.formatDate(t.dateFormat,a);if("object"==typeof t.dateFormat){var s={};for(name in t.dateFormat)s[name]=i?moment(a).format(t.dateFormat[name]):o.datepicker.formatDate(t.dateFormat[name],a);return s}},_buildTemplateData:function(e){var a=this,t=this.options,i={},s={items:[],years:[],yearsWithItems:[]};return o.each(e,function(e,t){if(-1==o.inArray(t.year,a.years))return!0;t.year in i||(i[t.year]=[]),s.items.push(t),i[t.year].push(t)}),t.showAllYears&&this.years.length&&s.years.push({year:t.allYearsText,value:-1,items:s.items}),o.each(this.years,function(e,t){s.years.push({year:t,value:t,items:i[t]||[]}),t in i&&s.yearsWithItems.push({year:t,value:t,items:i[t]})}),s},_renderItems:function(e){var a=this.options,t=this.element,i=o(a.itemContainer,t),t=(a.limitSort&&e.reverse(),{items:e});this._trigger("beforeRenderItems",null,t),a.itemLoadingClass&&i.removeClass(a.itemLoadingClass),t.items.length?(i.empty(),o.each(t.items,function(e,t){i.append(Mustache.render(a.itemTemplate,t))})):i.html(a.itemNotFoundMessage||""),this._trigger("itemsComplete")},_renderWidget:function(e){var a=this,i=this.options,s=this.element,r=(i.limitSort&&e.reverse(),this._buildTemplateData(e)),n=[];o.each(r.years,function(e,t){t.value==a.currentYear&&(t.active=!0,n=t.items)}),this._trigger("beforeRender",null,r),i.loadingClass&&this.$widget.removeClass(i.loadingClass),i.template&&this.$widget.html(Mustache.render(i.template,r)),i.itemContainer&&i.itemTemplate&&this._renderItems(n),i.yearContainer&&i.yearTemplate&&(o(i.yearContainer,s).empty(),r.years.length?o.each(r.years,function(e,t){o(i.yearContainer,s).append(Mustache.render(i.yearTemplate,t))}):o(i.yearContainer,s).append(i.noYearsMessage)),i.yearTrigger&&o(i.yearTrigger,s).each(function(e){var t=r.years[e].value;o(this).data("year",t),o(this).click(function(e){o(this).hasClass(i.activeClass)||a.setYear(t,e)})}),i.yearSelect&&o(i.yearSelect,s).off().change(function(e){a.setYear(o(this).val(),e)}),i.tagSelect&&o(i.tagSelect,s).off().change(function(e){a.setTags(o(this).val(),!0,e)}),i.tagTrigger&&(o(i.tagTrigger,s).each(function(e){o(this).click(function(e){o(this).hasClass(i.activeClass)||a.setTags(o(this).data("tag"),!0,e)})}),i.tags)&&this._updateTagControls(i.tags),i.customSelect,this._updateYearControls(this.currentYear),this._trigger("complete")},_updateYearControls:function(e){var t=this.options,a=this.element;t.yearTrigger&&o(t.yearTrigger,a).each(function(){o(this).toggleClass(t.activeClass,o(this).data("year")==e)}),t.yearSelect&&o(t.yearSelect,a).val(e)},_updateTagControls:function(e){var t=this.options,a=this.element;t.tagTrigger&&o(t.tagTrigger,a).each(function(){o(this).toggleClass(t.activeClass,o(this).data("tag")==e)}),t.tagSelect&&o(t.tagSelect,a).val(e)},contentTypes:{q4Downloads:{itemsUrl:["/Services/ContentAssetService.svc/GetContentAssetList","/feed/ContentAsset.svc/GetContentAssetList"],yearsUrl:["/Services/ContentAssetService.svc/GetContentAssetYearList","/feed/ContentAsset.svc/GetContentAssetYearList"],itemsResultField:"GetContentAssetListResult",yearsResultField:"GetContentAssetYearListResult",buildParams:function(e){return{assetType:e.downloadType}},parseItem:function(e,t){return{title:this._truncate(t.Title,e.titleLength),url:t.FilePath,dateObj:new Date(t.ContentAssetDate),year:new Date(t.ContentAssetDate).getFullYear(),date:this._formatDate(t.ContentAssetDate),type:t.Type,fileType:t.FileType,size:t.FileSize,icon:t.IconPath,thumb:t.ThumbnailPath,tags:t.TagsList,description:this._truncate(t.Description,e.bodyLength)}}},q4Events:{itemsUrl:["/Services/EventService.svc/GetEventList","/feed/Event.svc/GetEventList"],yearsUrl:["/Services/EventService.svc/GetEventYearList","/feed/Event.svc/GetEventYearList"],itemsResultField:"GetEventListResult",yearsResultField:"GetEventYearListResult",buildParams:function(e){return{eventSelection:e.showFuture&&!e.showPast?1:e.showPast&&!e.showFuture?0:3,eventDateFilter:e.showFuture&&!e.showPast?1:e.showPast&&!e.showFuture?0:3,includeFinancialReports:!1,includePresentations:!1,includePressReleases:!1,sortOperator:e.sortAscending?0:1}},parseItem:function(a,e){o.each(a.isTimeZoneKey,function(e,t){a.isTimeZoneKey[t]=t});var t=this,i=new Date,s="0"!=e.TimeZone&&a.isTimeZoneKey[e.TimeZone]||"",r=new Date(e.StartDate+" "+s),s=new Date(e.EndDate+" "+s);return{title:this._truncate(e.Title,a.titleLength),url:e.LinkToDetailPage,id:e.EventId,dateObj:r,year:r.getFullYear(),date:this._formatDate(e.StartDate),endDate:this._formatDate(e.EndDate),timeZone:"0"==e.TimeZone?"":e.TimeZone,isFuture:i<r,isPast:s<i,location:e.Location,tags:e.TagsList,body:this._truncate(e.Body,a.bodyLength),webcast:e.WebCastLink,docs:o.map(e.Attachments,function(e){return{title:e.Title,url:e.Url,type:e.Type,extension:e.Extension,size:e.Size,docType:e.DocumentType,docIconClassName:"online"==e.DocumentType?.toLowerCase().trim()?"evergreen-module-icon-link":"evergreen-module-icon"}}),speakers:o.map(e.EventSpeaker,function(e){return{name:e.SpeakerName,position:e.SpeakerPosition}}),financialReports:o.map(e.EventFinancialReport,function(e){return t.contentTypes.q4Financials.parseItem.call(t,a,e)}),pressReleases:o.map(e.EventPressRelease,function(e){return t.contentTypes.q4News.parseItem.call(t,a,e)}),presentations:o.map(e.EventPresentation,function(e){return t.contentTypes.q4Presentations.parseItem.call(t,a,e)})}}},q4Financials:{itemsUrl:["/Services/FinancialReportService.svc/GetFinancialReportList","/feed/FinancialReport.svc/GetFinancialReportList"],yearsUrl:["/Services/FinancialReportService.svc/GetFinancialReportYearList","/feed/FinancialReport.svc/GetFinancialReportYearList"],itemsResultField:"GetFinancialReportListResult",yearsResultField:"GetFinancialReportYearListResult",buildParams:function(e){return{reportTypes:e.reportTypes.join("|"),reportSubType:e.reportTypes,reportSubTypeList:e.reportTypes}},parseItem:function(t,e){var a=this,i=o.map(e.Documents,function(e){return{docCategory:e.DocumentCategory,docSize:e.DocumentFileSize,docIcon:t.categoryIcons[e.DocumentType?.toLowerCase().trim()]||e.IconPath,docThumb:e.ThumbnailPath,docTitle:a._truncate(e.DocumentTitle,t.titleLength),docType:e.DocumentFileType,docUrl:e.DocumentPath}});return o.isArray(t.docCategories)&&t.docCategories.length&&(i=o.grep(i,function(e){return-1<o.inArray(e.docCategory,t.docCategories)})),{coverUrl:e.CoverImagePath,title:e.ReportTitle,fiscalYear:e.ReportYear,dateObj:new Date(e.ReportDate),year:e.ReportYear,date:this._formatDate(e.ReportDate),tags:e.TagsList,type:e.ReportSubType,shortType:null!=t.shortTypes?t.shortTypes[e.ReportSubType]:e.ReportSubType,docs:i}}},q4Presentations:{itemsUrl:["/Services/PresentationService.svc/GetPresentationList","/feed/Presentation.svc/GetPresentationList"],yearsUrl:["/Services/PresentationService.svc/GetPresentationYearList","/feed/Presentation.svc/GetPresentationYearList"],itemsResultField:"GetPresentationListResult",yearsResultField:"GetPresentationYearListResult",buildParams:function(e){var t={};return this._usePublic()?t.presentationDateFilter=e.showFuture&&!e.showPast?0:e.showPast&&!e.showFuture?1:3:t.presentationSelection=e.showFuture&&!e.showPast?0:e.showPast&&!e.showFuture?1:3,t},parseItem:function(e,t){return{title:this._truncate(t.Title,e.titleLength),url:t.LinkToDetailPage,dateObj:new Date(t.PresentationDate),year:new Date(t.PresentationDate).getFullYear(),date:this._formatDate(t.PresentationDate),tags:t.TagsList,body:this._truncate(t.Body,e.bodyLength),docUrl:t.DocumentPath,docSize:t.DocumentFileSize,docType:t.DocumentFileType,audioUrl:t.AudioFile,audioType:t.AudioFileType,audioSize:t.AudioFileSize,videoUrl:t.VideoFile,videoType:t.VideoFileType,videoSize:t.VideoFileSize,relatedUrl:t.RelatedFile,relatedType:t.RelatedFileType,relatedSize:t.RelatedFileSize,thumb:t.ThumbnailPath}}},q4News:{itemsUrl:["/Services/PressReleaseService.svc/GetPressReleaseList","/feed/PressRelease.svc/GetPressReleaseList"],yearsUrl:["/Services/PressReleaseService.svc/GetPressReleaseYearList","/feed/PressRelease.svc/GetPressReleaseYearList"],itemsResultField:"GetPressReleaseListResult",yearsResultField:"GetPressReleaseYearListResult",buildParams:function(e){var t=e.loadShortBody?e.loadBody?1:3:e.loadBody?2:0,a={};return this._usePublic()?(a.bodyType=t,a.pressReleaseDateFilter=e.showFuture&&!e.showPast?0:e.showPast&&!e.showFuture?1:3,a.categoryId=e.category):(a.pressReleaseBodyType=t,a.pressReleaseSelection=e.showFuture&&!e.showPast?0:e.showPast&&!e.showFuture?1:3,a.pressReleaseCategoryWorkflowId=e.category),a},parseItem:function(e,t){return{title:this._truncate(t.Headline,e.titleLength),url:t.LinkToDetailPage,dateObj:new Date(t.PressReleaseDate),year:new Date(t.PressReleaseDate).getFullYear(),date:this._formatDate(t.PressReleaseDate),tags:t.TagsList,category:t.Category,excludeFromLatest:t.ExcludeFromLatest,languageId:t.LanguageId,linkToPage:t.LinkToPage,linkToUrl:t.LinkToUrl,pressReleaseId:t.PressReleaseId,shortDescription:t.ShortDescription,seoName:t.SeoName,body:this._truncate(t.Body,e.bodyLength),shortBody:this._truncate(t.ShortBody,e.shortBodyLength),docUrl:t.DocumentPath,docSize:t.DocumentFileSize,docType:t.DocumentFileType,docIconClassName:"online"==t.DocumentType?.toLowerCase().trim()?"evergreen-module-icon-link":"evergreen-module-icon",thumb:t.ThumbnailPath||e.defaultThumb,media:o.map(t.MediaCollection,function(e){return{alt:e.Alt,url:e.SourceUrl,type:e.Style,height:e.Height,width:e.Width}}),attachments:o.map(t.Attachments,function(e){return{type:e.DocumentType,extension:e.Extension,size:e.Size,title:e.Title,category:e.Type,url:e.Url}}),multimedia:o.map(t.MediaFiles,function(e){return{id:e.PressReleaseMediaFileId,active:e.Active,thumbnail:e.ThumbnailPath,type:e.FileType,height:e.Height,url:e.Path,fileSize:e.Size,title:e.Title,category:e.Type,width:e.Width,sizes:o.map(e.Sizes,function(e){return{url:e.Path,category:e.Type,fileSize:e.Size,height:e.Height,width:e.Width}})}})}}},q4Sec:{itemsUrl:["/Services/SECFilingService.svc/GetEdgarFilingList","/feed/SECFiling.svc/GetEdgarFilingList"],yearsUrl:["/Services/SECFilingService.svc/GetEdgarFilingYearList","/feed/SECFiling.svc/GetEdgarFilingYearList"],itemsResultField:"GetEdgarFilingListResult",yearsResultField:"GetEdgarFilingYearListResult",buildParams:function(e){return{exchange:e.exchange,symbol:e.symbol,formGroupIdList:e.filingGroups.join(","),filingTypeList:e.filingTypes.join(","),excludeNoDocuments:e.excludeNoDocuments,includeHtmlDocument:e.includeHtmlDocument}},parseItem:function(e,t){return{id:t.FilingId,description:this._truncate(t.FilingDescription,e.titleLength),url:t.LinkToDetailPage,dateObj:new Date(t.FilingDate),year:new Date(t.FilingDate).getFullYear(),date:this._formatDate(t.FilingDate),agent:t.FilingAgentName,person:t.ReportPersonName,type:t.FilingTypeMnemonic,docs:o.map(t.DocumentList,function(e){return{docType:e.DocumentType,docUrl:e.Url.replace(/(\w+:)/,"")}})}}}}}),o.widget("evergreen.q4Downloads",o.evergreen.q4Api,{options:{template:"",downloadType:null}}),o.widget("evergreen.q4Events",o.evergreen.q4Api,{options:{showFuture:!0,showPast:!0,template:""}}),o.widget("evergreen.q4Financials",o.evergreen.q4Api,{options:{reportTypes:[],shortTypes:{"Annual Report":"AR","Supplemental Report":"SR","First Quarter":"Q1","Second Quarter":"Q2","Third Quarter":"Q3","Fourth Quarter":"Q4","ESG Report":"ESG"},docCategories:[],template:""},_sortItemsByType:function(e){var a=this.options,t=[],i={};return o.each(e,function(e,a){-1==o.inArray(a.type,t)&&(t.push(a.type),i[a.type]=[]),o.each(a.docs,function(e,t){i[a.type].push(t)})}),o.map(t,function(e,t){return{type:e,shortType:a.shortTypes[e],items:i[e]}})},_buildTemplateData:function(e){var a=this,e=this._super(e);return e.types=this._sortItemsByType(e.items),o.each(e.years,function(e,t){t.types=a._sortItemsByType(t.items)}),e}}),o.widget("evergreen.q4Presentations",o.evergreen.q4Api,{options:{showFuture:!0,showPast:!0,template:""}}),o.widget("evergreen.q4News",o.evergreen.q4Api,{options:{category:"1cb807d2-208f-4bc3-9133-6a9ad45ac3b0",loadBody:!1,loadShortBody:!1,template:""}}),o.widget("evergreen.q4Sec",o.evergreen.q4Api,{options:{exchange:"",symbol:"",filingTypes:[],filingGroups:[],docOrder:["CONVPDF","RTF","XLS","XBRL","XBRL_HTML","HTML","CONVTEXT","ORIG"],excludeNoDocuments:!1,includeHtmlDocument:!1,numOfYears:0,template:""}})})($tudio);