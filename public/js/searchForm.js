$(function(){
    $('#btn-search').click(function (e) { 
        e.preventDefault();
        let nameProduct = $('#name-product').val();
        let manufacturerName = $('#brands option:selected').text();
        let categoryName = $('#categories option:selected').text();
        let optionPrice = $('input[name=optionsPrice]:checked', '#search-product').val();
        window.location = `/search?key=${nameProduct}&manufacturer=${manufacturerName}&category=${categoryName}&price=${optionPrice}`;
    });
});
