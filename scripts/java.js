var projectNumber = 14;

var scrolled = 0;
var open = false;
var openID = "";
var hoverTimeout = false;

var touch = false;
var mobile = false;
var t = 0;

$(document).ready(function(){
  clock();

  function clock(){
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
     if(s<10){
       s = "0" + s;
     }
     if (m < 10) {
       m = "0" + m;
     }
     if (h < 10) {
       h = "0" + h;
     }
    $(".clock").html(h+":"+m+":"+s);

     setTimeout(function(){clock()}, 500);
  }

  $(".project--number").each(function(index) {
      var number = index;
      if (number >= 10){
        number = index;
      }else{
        number = "0" + index;
      }
      $(this).html(number);
  });

  if ("ontouchstart" in document.documentElement){
    touch = true;
  }

  if (window.innerWidth <= 900){
    mobile = true;
  }

  $(window).scroll(function() {
    var titleTop = $(".intro").outerHeight() - ($(window).outerHeight()*0.88);
    var introHeight = Math.abs(titleTop);

      if($(window).scrollTop() >= introHeight){
        $(".intro").css({"transform":"translate(0,"+ -($(window).scrollTop()-introHeight) +"px)"});
      }else{
        $(".intro").css({"transform":""});
      }


    if($(window).scrollTop() >= $(window).innerHeight() * 0.94) {
      scrolled = 1;
    }else{
      scrolled = 0;
    };
  });


  $(".project").each(function(index){
    var selectedHeight = 100 - 2 - ((projectNumber) * 2) - 6;
    if(mobile){
      var contentHeight = 0.55 * window.innerHeight;
      if(contentHeight < $(this).children(".project--info").height()){
        selectedHeight += (($(this).children(".project--info").height() - contentHeight) / window.innerHeight) * 100 - 2;
      }
    }
    $(this).css({"height": "calc(" + selectedHeight + "vh - 11px)", "top": (index+1)*6 + "vh"});
    $(this).attr("id", "project--" + (index+1));
  });

  $(".project").mousedown(function(e){
    if(!$(this).hasClass("project--end") && !$(this).hasClass("open")){
      $(this).children(".button--info").css({"opacity": 1});
      openProject(this);
    }
  });

  $(".project--content, .button--info").mousedown(function(){
    var infoHeight = $(this).siblings(".project--info").height();
    if(!mobile){
      if($(this).siblings(".project--info").css("opacity") == 0 && open){
        $(this).css({"transform":"translateY(calc("+infoHeight+"px + 1vh))"});
        $(".content--hover").html('<span class="font--business">↑</span> Info');
        $(".project--content, .button--info").delay(300).queue(function (next) {
          $(this).siblings(".project--info").css({"opacity": 1});
          $(this).siblings(".project--info").children("a").css({"pointer-events": "auto"});
          next();
        });
      } else {
        $(this).siblings(".project--info").css({"opacity": 0});
        $(this).siblings(".project--info").children("a").css({"pointer-events": "none"});
        $(".project--content, .button--info").delay(300).queue(function (next) {
          $(this).css({"transform":"translateY(0)"});
          $(".content--hover").html('<span class="font--business">↓</span> Info');
          next();
        });
      }
    } else {
        if($(this).siblings(".project--info").css("opacity") == 0 && open){
          $(this).siblings(".project--info").children("a").css({"pointer-events": "auto"});
          if($(this).hasClass("button--info")){
            $(this).text('↑');
          }else{
            $(this).siblings(".button--info").text('↑');
          }
          if($(this).hasClass("project--content")){
            $(this).css({"transform":"translateY(calc("+infoHeight+"px))"});
          }else{
            $(this).siblings(".project--content").css({"transform":"translateY(calc("+infoHeight+"px))"});
          }
          $(this).delay(300).queue(function (next) {
            $(this).siblings(".project--info").css({"opacity": 1});
            $(this).siblings(".project--info").children("a").css({"pointer-events": "auto"});
            next();
          });
        } else {
          $(this).siblings(".project--info").css({"opacity": 0});
          $(this).siblings(".project--info").children("a").css({"pointer-events": "none"});
          if($(this).hasClass("button--info")){
            $(this).text('↓');
          }else{
            $(this).siblings(".button--info").text('↓');
          }
          $(this).delay(300).queue(function (next) {
            if($(this).hasClass("project--content")){
              $(this).css({"transform":"translateY(0)"});
            }else{
              $(this).siblings(".project--content").css({"transform":"translateY(0)"});
            }
            $(this).siblings(".project--info").children("a").css({"pointer-events": "auto"});
            next();
          });
        }

    }
  });


  $(".project").hover(function(){
    if(!open && !hoverTimeout && !mobile){
      var id = this.id;
      var index = $(this).index(".project");
      $(this).children(".project--content").css("opacity", 1);
      openID = id;
      var offset = 0;
      for(var i = 0; i < projectNumber; i++){
        if(i < index){
          $(".project:eq("+i+")").css({"transform": "translate3d(0, "+ offset+"vh, 0)"});
          offset -= 0;
        }
        if(i == index){
          $(".project:eq("+i+")").css({"transform": "translate3d(0, "+ offset+"vh, 0)"});
          offset += 6;
        }
        if(i > index){
          $(".project:eq("+i+")").css({"transform": "translate3d(0, "+ offset+"vh, 0)"});
          offset -= 0;
        }
      }
    }
  }, function(){
    if(touch){
      $(".open video").each(function(){
        var that = $(this);
        setTimeout(function(){
          that.addClass("lazy").attr("data-src", that.attr("src")).attr("src", "");
        }, 500);
      });
    }
    $(".project").removeClass("open");
    $(this).children(".button--info").css({"opacity": 0});
    if(!mobile){
      var id = this.id;
      if(id == openID && !hoverTimeout){
        $(".project").css({"transform": "translate3d(0, 0, 0)"});
        open = false;
      }
      var index = $(this).index(".project");
      $(".project--content").css({"opacity":"0","transform":"translateY(0)"});
      $(".project--info").css("opacity", 0);
      $(".content--hover").html('<span class="font--business">↓</span> Info');
      $(".project").css({"cursor":"ns-resize"});
      $(".projects").css({"height":"calc(100vh + 3px)"})
    }
  });

  $("video").on("loadedmetadata", function(){
    layout();
    $(this).css("opacity", 1);
  });

  $(".button--arrow").hover(function(){
    if(!mobile){
      $(this).css("transform", "translateX(-35px)");
      $(this).children().css({"transform":"translateX(35px)","opacity":"1"});
    }
  }, function(){
    if(!mobile){
      $(this).css("transform", "translateX(0)");
      $(this).children().css({"transform":"translateX(0px)","opacity":"0"});
    }
  });

  $(".project--content").hover(function(){
  }, function(){
    $(".content--hover").css("opacity", 0);
  });

  $(".project--content").mousemove(function(e){
    if(!mobile){
      if(open){
        $(".content--hover").css({"transform": "translate("+ e.clientX +"px, "+ e.clientY +"px)", "opacity": 1});
        $(".project--content").css({"cursor": "none"});
      } else {
        $(".project--content").css({"cursor": "pointer"});
      }
    }
  });

  layout();
  requestAnimationFrame(anim);
  window.addEventListener( 'resize', onResizeLayout, false );

});

function layout(){
  $(".project").each(function(){
    var offset = 10;
    $(this).children(".project--content").children().children().each(function(index){
      var y = 0;
      if($(this).hasClass("window")){
        y = -10;
      }
      $(this).css("transform", "translate3d("+offset+"px, "+y+"%, 0)");
      offset += $(this).innerWidth() + 20;
    });
  });
}

function openProject(that){
  hoverTimeout = true;
  $(that).addClass("open");
  var id = that.id;
  var index = $(that).index(".project");
  if($(that).children(".project--content").css("opacity") == 0 && $(that).children(".project--info").css("opacity") == 0){
    $(that).children(".project--content").css("opacity", 1);
  }
  if(!$(that).hasClass("project--end") ){
    open = true;
    openID = id;
    var offset = 0;
    $(that).children(".project--content").children().children().each(function(){
      if($(this).hasClass("lazy")){
        $(this).attr("src", $(this).attr("data-src"));
        var that = this;
        $(".lazy").one("load", function() {
          console.log("image load");
          layout();
          $(this).css("opacity", 1);
          $(this).removeClass("lazy");
        });
      }
    });
    for(var i = 0; i < projectNumber; i++){
      if(!mobile){
        if(i < index){
          $(".project:eq("+i+")").css({"transform": "translate3d(0, "+ offset+"vh, 0)"});
          offset -= 0;
        }
        if(i == index){
          $(".project:eq("+i+")").css({"transform": "translate3d(0, "+ offset+"vh, 0)"});
          offset += ($(".project:eq("+i+")").height()/window.innerHeight)*100 - 4;
        }
        if(i > index){
          $(".project:eq("+i+")").css({"transform": "translate3d(0, "+ offset+"vh, 0)"});
          offset -= 0;
        }
      } else {
        if(i < index){
          $(".project:eq("+i+")").css({"transform": "translate3d(0, "+ offset+"vh, 0)"});
          offset -= 0;
        }
        if(i == index){
          $(".project:eq("+i+")").css({"transform": "translate3d(0, "+ offset+"vh, 0)"});
          offset += ($(".project:eq("+i+")").height()/window.innerHeight)*100 - 4;
        }
        if(i > index){
          $(".project:eq("+i+")").css({"transform": "translate3d(0, "+ offset+"vh, 0)"});
          offset -= 0;
        }
      }
    }
    var projectsBarHeight = $("#topBar").height();
    $(".project").css("cursor", "default");
    if(mobile){
      $(".projects").css({"height": (offset + projectNumber*6)+ "vh"});
    } else {
      $(".projects").css({"height": (offset + projectNumber*6)+ "vh"});
      $("html, body").animate({"scrollTop": ($(that).offset().top-(projectsBarHeight*1.5)+2)}, 500);
    }
  }

  setTimeout(function(){
    hoverTimeout = false;
  }, 250);
}

function anim(){
  if(open && $("#" + openID + " .project--content").css("display") != "none"){
    $("#" + openID + " .img").each(function(i){
      var offset = $(this).offset().left;
      if(offset < (0 - $(this).innerWidth())){
        var index = i - 1;
        if(index < 0){
          index = $("#" + openID + " .img").length - 1;
        }
        var prev = $("#" + openID + " .img:eq("+index+")");
        var currTrans = prev.css('transform').split(/[()]/)[1];
        var posx = currTrans.split(',')[4];
        offset = parseInt(posx) + prev.innerWidth() + 20;
        var y = 0;
        if($(this).hasClass("window")){
          y = -10;
        }
        $(this).css("transform", "translate3d("+offset+"px, "+y+"%, 0)");
      }
    });
    t = $("#" + openID + " .scroller").attr("data-t");
    t -= 1;
    $("#" + openID + " .scroller").attr("data-t", t);
    $("#" + openID + " .scroller").css("transform", "translate3D("+t+"px, 0, 0)");
  }
  requestAnimationFrame(anim);
}

function onResizeLayout(){
  if(!touch){
    layout();
  }
}
