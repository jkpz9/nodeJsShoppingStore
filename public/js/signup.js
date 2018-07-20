 var cities = [{id:1,city:"Canada"},{id:2,city:"USA"}]; 
       var districts = [{id:1, district:["Toronto", "Montreal", "Quebec"]},
       {id:2, district:["New York", "Michigan", "Last Vergas"]}]
        function addOption(elId)
        {
            var sel = document.getElementById(elId);
        var fragment = document.createDocumentFragment();
        cities.forEach(function(city, index) {
            var opt = document.createElement('option');
            opt.innerHTML = city.city;
            opt.value = city.id;
            fragment.appendChild(opt);
        });
        sel.appendChild(fragment);
        }
       
        addOption('sel1');
        $('select#sel1').on('change', function() {
         var id = this.value;
         var districtsBelong = districts.filter(x => x.id == id);
         $('#sel2').empty();
         var sel = document.getElementById('sel2');
        var fragment = document.createDocumentFragment();
        districtsBelong[0].district.forEach(function(districtz, index) {
            var opt = document.createElement('option');
            opt.innerHTML = districtz;
            opt.value = districtz;
            fragment.appendChild(opt);
        });
        sel.appendChild(fragment);
        })