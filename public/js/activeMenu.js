$(document).ready(()=> {
    $("#menu-home").removeClass('active');
    let isActive = $("#title-page").text().trim();

    if(isActive.search('SHOP PAGE') != -1){
        
        $("#menu-shop").addClass('active');
    }

    else if(isActive.search('MANUFACTURER') != -1){
        
        $("#menu-manufacturer").addClass('active');
    }

    else if(isActive.search('CATEGORY') != -1){
        
        $("#menu-category").addClass('active');
    }

    else if(isActive.search('CART') != -1){
        
        $("#menu-cart").addClass('active');
    }

    else if(isActive.search('ABOUT US') != -1){
        
        $("#menu-aboutus").addClass('active');
    }

    else if(isActive.search('CONTACT US') != -1){
        
        $("#menu-contactus").addClass('active');
    }
    
    else{
        $("#menu-home").addClass('active');
    }
});
