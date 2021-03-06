$(window).load(function(){
    var $body=$(document.body)
    
    // headroom plugin initialisation
    $body.headroom({
        offset:60,
        tolerance:5,
        classes:{
            pinned:null,
            unpinned:null
        },
        events:{
            onPinned:function(){
                $(this.elem).removeClass("headroom--unpinned")
            },
            onUnpinned:function(){
                if(window.scrollY>600){
                    $(this.elem).addClass("headroom--unpinned")
                }
            }
        }
    });
});




(function(){
    var $body=$(document.body),
        supportsSticky=featureTest( 'position', 'sticky' ),
        topBar=$("#topBar"),
        topBarHeight=topBar.outerHeight(true),

        sectionTitle=topBar.find(".sectionTitle");



        // media query helper to make JS aware of the current MQ
        // $("#mqHelper").on("mqChange",function(e,device){
        //     console.log(device)
        // })


    // populating the topBar
        // document title
        var documentTitle=topBarHandler.cells.b.addItem($("<p class='documentTitle'><span/></p>")),
            docTitle=$(".document__title");
      
        documentTitle.$el.find("span").text(docTitle.text());


        // adding the logo image
        var logo=topBarHandler.cells.a.addItem($('<a class="aduLogo" href="#"><img src="assets/Adu_logo.png" alt="Adu logo" title="Adu"/></a>')).show();
        logo.$el.click(function(e){
            // scrolling to on click
            e.preventDefault();
            $("html,body").animate({"scrollTop":0},800);
        })

        // adding the left arrow to close the TOC on mobile
        var closeToc=topBarHandler.cells.a.addItem($('<a class="closeToc" href="#"><img src="assets/left-arrow.png" alt="close toc" title="close Toc"/></a>'))
        closeToc.$el.click(function(e){
            e.preventDefault();
            toggleTOC(false);
        })


        // creating the TOC button
        var tocButton=topBarHandler.cells.c.addItem($('<button class="tocButton flatButton closed"><span>Table of contents</span></button>')),
            tocLabelText=$(".jump-to-section__nav-title").text();

        //setting the tocButton click event handler
        tocButton.$el.click(toggleTOC);
        $("#document__TocLink").click(function(e){
            e.preventDefault();
            $("html,body").scrollTop($(this).offset().top);
            // giving the browser time to scroll
            setTimeout(toggleTOC,80)
        });

        tocLabel=topBarHandler.cells.b.addItem($("<p class='tocLabel'><span/></p>").text(tocLabelText));

        // recalculating the tobBar height
        topBarHeight=topBar.outerHeight(true);


        // logic for showing the document title
        docTitle.hotSpot({
            gone:function(isAbove){
                if(isAbove){
                    documentTitle.show();
                }else{
                    documentTitle.hide();
                }
            },
            enter:function(){
                documentTitle.hide()
            },
            top:topBarHeight+13
        });

        // logic for showing the TOC button in the top bar
        $("#sideNavigation, #document__TocLink").hotSpot({
            enter:function(){
                hideTOCbutton();
            },

            gone:function(isAbove){
                if(isAbove){
                    showTOCbutton();
                }else{
                    hideTOCbutton();           
                }
            },
            top:topBarHeight+13
        })



        var navTreeClone=$("<div id='navTreeClone'></div>")
                .css("top",topBarHeight)
                .appendTo(topBar)




        // $(".main-content").on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(e){
        //     $(this).
        // })


        // due to a known browser bug, resize event could fire more than once
        var resizeHnd=new deBouncer(100);

        $(window).on("resize",function(){
            // fixing the navigation height on window resise
            resizeHnd.execute(fixNavHeight);
        });


        // animating the scroll on menu click
        $("#sideNavigation").children("ul")
            .on("click","a",function(e){
                e.preventDefault();
                var tbHeight=topBar.outerHeight(true),
                    device=$body.getDevice();

                if(device=="mobile"){
                    toggleTOC();
                }
                var $this=this,
                    that=this,
                    targetTop=$(this.hash).offset().top-tbHeight;
                    //fixing the scroll-top issue (when sticky elements are employed in the page)

                    if(device=="mobile"){
                        if(targetTop>$(window).scrollTop()){
                            targetTop=$(that.hash).offset().top
                        }
                        $("html,body").animate({"scrollTop":targetTop},500);
                    }else{
                        $("html,body").animate({"scrollTop":targetTop},500);                        
                    }

            })
            .clone(true)
            .appendTo(navTreeClone);







    var stickySection=$(".documentSection"),
        stickyHeader=stickySection.find("h2");

    if(!supportsSticky){
        //fixing the position:sticky
        stickyHeader.each(function(){
            var $this=$(this)
            // creating a clone as placeholder
            $this.clone().addClass("clone").insertAfter($this);
            $this.addClass("_fixed")
        })

        $(window).on("resize",function(){setFixedHeaderWidth()})

        function setFixedHeaderWidth(){
            stickySection.each(function(){
                var $this=$(this),
                    header=$this.find("._fixed");
                header.css("width",header.next(".clone").width())
            })
        }
        //calling it on page load
        setFixedHeaderWidth();
    }


    // adding border-bottom and grey shade to sections when they get sticky (also fixing position:sticky)
    stickySection.hotSpot({
        enter:function(){
            var h2=this.find("h2:first")
                .addClass("isSticky")

            if(!supportsSticky){
                h2.show()
            }
            // highlighting the current section on the nav menu
            navTreeClone.find("a[href='#" + this.attr("id") + "']").addClass("current")
        },
        gone:function(){
            var h2=this.find("h2:first")
                .removeClass("isSticky")

            if(!supportsSticky){
                h2.hide()
            }
            navTreeClone.find("a[href='#" + this.attr("id") + "']").removeClass("current")
        },
        top:topBarHeight+2,
        thickness:0
    })



    // helpers func.
    function toggleTOC(status){
        tocButton.$el.toggleClass("closed",status);
        $body.toggleClass("showNavigation",status);

        if($body.hasClass("showNavigation")){
            // TOC clone
            fixNavHeight();            
        }
        if(tocLabel.$el.hasClass("show")){
            documentTitle.show();
            logo.show();
        }else{
            if($body.getDevice()=="mobile"){
                tocLabel.show(); 
                closeToc.show();               
            }
        }
    }

    function showTOCbutton(){
        tocButton.show();
    }

    function hideTOCbutton(){
        tocButton.hide();
        tocButton.$el.addClass("closed");

        $body.removeClass("showNavigation");          
    }

    function fixNavHeight(){
        navTreeClone.height("auto").scrollTop(0);

        if(navTreeClone.outerHeight()>document.documentElement.clientHeight-topBarHeight){
            navTreeClone.height(document.documentElement.clientHeight-topBarHeight)        
        }
    }

})();



  function featureTest( property, value, noPrefixes ) {
    // Thanks Modernizr! https://github.com/phistuck/Modernizr/commit/3fb7217f5f8274e2f11fe6cfeda7cfaf9948a1f5
    var prop = property + ':',
      el = document.createElement( 'test' ),
      mStyle = el.style;

    if( !noPrefixes ) {
      mStyle.cssText = prop + [ '-webkit-', '-moz-', '-ms-', '-o-', '' ].join( value + ';' + prop ) + value + ';';
    } else {
      mStyle.cssText = prop + value;
    }
    return mStyle[ property ].indexOf( value ) !== -1;
  }

