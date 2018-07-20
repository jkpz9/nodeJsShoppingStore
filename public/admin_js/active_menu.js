$(function(){
    let url = window.location.href.trim();
    $("#menu-dashboard").removeClass('active');
    if(url.search("categories_management")!=-1){
        $("#menu-category").addClass("active");
    }
    else if (url.search("manufacturers_management")!=-1){
        $("#menu-manufacturer").addClass("active");
    }
    else if (url.search("products_management")!=-1){
        $("#menu-product").addClass("active");
    }
    else if (url.search("orders_management")!=-1){
        $("#menu-order").addClass("active");
    }
    else{
        $("#menu-dashboard").addClass("active");
    }
});