(function(){
    "use strict";

    var Moosipurk = function(){

        // SEE ON SINGLETON PATTERN
        if(Moosipurk.instance){
            return Moosipurk.instance;
        }
        //this viitab Moosipurk fn
        Moosipurk.instance = this;

        this.routes = Moosipurk.routes;
        // saame lehe laadimiseks kasutada hiljem this.routes['home-view'].render()

        console.log('moosipurgi sees');

        // KÕIK muuutujad, mida muudetakse ja on rakendusega seotud defineeritakse siin
        this.click_count = 0;
        this.currentRoute = null;

        //id, mis läheb purgile kaasa, alustame nullist, tegelikult võiks olla unikaalne
        this.jar_id = 0;

        // hakkan hoidma siin kõiki purke
        this.jars = [];

        // Kui tahan Moosipurgile referenci siis kasutan THIS = MOOSIPURGI RAKENDUS ISE
        this.init();
    };

    // kõik lehed, teistes raamistikes võib käsitleda neid view'dena
    // render funktsioon käivtatakse selle konkreetse lehe laadimisel
    Moosipurk.routes = {
        'home-view': {
            'render': function(){
                // käivitame siis kui lehte laeme
                console.log('>>>>avaleht');
            }
        },
        'list-view': {
            'render': function(){
                // käivitame siis kui lehte laeme
                console.log('>>>>loend');

                // peidan loendi ja näitan loading...
                document.querySelector('.list-of-jars').style.display = 'none';
                document.querySelector('.loading').style.display = 'block';


                //simulatsioon laeb kaua
                window.setTimeout(function(){

                    // peidan loading... ja näitan loendit
                    document.querySelector('.loading').style.display = 'none';
                    document.querySelector('.list-of-jars').style.display = 'block';

                }, 2000);

            }
        },
        'manage-view': {
            'render': function(){
                // käivitame siis kui lehte laeme
            }
        }
    };

    // Kõik funktsioonid lähevad Moosipurgi külge
    Moosipurk.prototype = {

        init: function(){
            console.log('Rakendus läks tööle');

            //kuulan aadressirea vahetust, ehk kui aadressireale tuleb #lehe nimi
            window.addEventListener('hashchange', this.routeChange.bind(this));

            // kui aadressireal ei ole hashi siis lisan juurde, et avaleht
            if(!window.location.hash){
                window.location.hash = 'home-view';
                // routechange siin ei ole vaja sest käsitsi muutmine käivitab routechange event'i ikka
            }else{
                //esimesel käivitamisel vaatame urli üle ja uuendame menüüd
                this.routeChange();
            }

            //saan kätte purgid localStorage kui on
            if(localStorage.jars){
                //võtan stringi ja teen tagasi objektideks
                this.jars = JSON.parse(localStorage.jars);
                console.log('laadisin localStorageist massiiivi ' + this.jars.length);

                //tekitan loendi htmli
                this.jars.forEach(function(jar){

                    var new_jar = new Jar(jar.id, jar.title, jar.ingredients);

                    //uuendad moosipurgi id'd et hiljem jätkata kus pooleli jäi
                    Moosipurk.instance.jar_id = jar.id;

                    // eraldi funktsioonis tekitan <li> elemendi ja lisan loendisse
                    var li = new_jar.createHtmlElement();
                    document.querySelector('.list-of-jars').appendChild(li);

                });

                // suurendame id'd järgmise purgi jaoks ühe võrra
                // kui eelmine oli 2 siis järgmine oleks 3
                this.jar_id++;
            }


            // kuulame sündmusi, kui keegi miskit teeb
            this.bindEvents();

        },

        bindEvents: function(){

            // uue purgi lisamine
            document.querySelector('.add-new-jar').addEventListener('click', this.addNewClick.bind(this));

            //kuulan trükkimist otsikastis
            document.querySelector('#search').addEventListener('keyup', this.search.bind(this));

        },

        deleteJar: function(event){

            var c = confirm('kustuta?');

            //kui ei olnud nõus katkestame
            if(!c){ return; }

            //li element
            console.log(event.target.parentNode);
            //id (data-id väärtus)
            console.log(event.target.dataset.id);

            //kustutame HTMList, leian valitud
            var clicked_li = event.target.parentNode;
            document.querySelector('.list-of-jars').removeChild(clicked_li);

            //kustutan massiivist
            this.jars.forEach(function(jar, i){

                //sama id, mis vajutasime
                if(jar.id == event.target.dataset.id){

                    //mis index ja mitu. + lisaks splice lubab vajadusel asendada
                    Moosipurk.instance.jars.splice(i, 1);
                }

            });

            // salvesta uuesti localStorage'isse
            localStorage.setItem('jars', JSON.stringify(this.jars));

        },

        search: function(event){

            //otsikasti väärtus
            var needle = document.querySelector('#search').value.toLowerCase();
            console.log(needle);

            var list = document.querySelectorAll('ul.list-of-jars li');
            console.log(list);

            for(var i = 0; i < list.length; i++){

                var li = list[i];

                // ühe listitemi sisu tekst
                var stack = li.querySelector('.content').innerHTML.toLowerCase();

                //kas otsisõna on sisus olemas
                // css'iga peitmine ja näitamine on kõige kiirem kui elemendi kustutamine!
                if(stack.indexOf(needle) !== -1){
                    //olemas
                    li.style.display = 'list-item';

                }else{
                    //ei ole, index on -1, peidan
                    li.style.display = 'none';

                }

            }
        },

        addNewClick: function(event){
            //salvestame purgi
            //console.log(event);

            var title = document.querySelector('.title').value;
            var ingredients = document.querySelector('.ingredients').value;

            //console.log(title + ' ' + ingredients);
            //1) tekitan uue Jar'i
            var new_jar = new Jar(this.jar_id, title, ingredients);

            //suurendan id'd järgmise purgi jaoks
            this.jar_id++;

            //lisan massiiivi purgi
            this.jars.push(new_jar);
            console.log(JSON.stringify(this.jars));

            // JSON'i stringina salvestan kõik purgid localStorage'isse
            localStorage.setItem('jars', JSON.stringify(this.jars));

            // 2) lisan selle htmli listi juurde
            var li = new_jar.createHtmlElement();
            document.querySelector('.list-of-jars').appendChild(li);

        },

        routeChange: function(event){

            //kirjutan muuutujasse lehe nime, võtan maha #
            this.currentRoute = location.hash.slice(1);
            console.log(this.currentRoute);

            //kas meil on selline leht olemas?
            if(this.routes[this.currentRoute]){

                //muudan menüü lingi aktiivseks
                this.updateMenu();

                this.routes[this.currentRoute].render();


            }else{
                /// 404 - ei olnud
            }


        },

        updateMenu: function() {
            //http://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript
            //1) võtan maha aktiivse menüülingi kui on
            document.querySelector('.active-menu').className = document.querySelector('.active-menu').className.replace('active-menu', '');

            //2) lisan uuele juurde
            //console.log(location.hash);
            document.querySelector('.'+this.currentRoute).className += ' active-menu';

        }

    }; // MOOSIPURGI LÕPP


    // eraldi purk, võib käsitleda kui klassi
    var Jar = function(new_id, new_title, new_ingredients){
        this.id = new_id;
        this.title = new_title;
        this.ingredients = new_ingredients;
        console.log('created new jar');
        console.log(this);
    };

    Jar.prototype = {
        createHtmlElement: function(){

            // võttes title ja ingredients ->
            /*
            li
                span.letter
                    M <- title esimene täht
                    span.content
                        title | ingredients
                    span
                        kustuta
            */

            var li = document.createElement('li');

            var span = document.createElement('span');
            span.className = 'letter';

            var letter = document.createTextNode(this.title.charAt(0));
            span.appendChild(letter);

            li.appendChild(span);

            var span_with_content = document.createElement('span');
            span_with_content.className = 'content';

            var content = document.createTextNode(this.title + ' | ' + this.ingredients);
            span_with_content.appendChild(content);

            li.appendChild(span_with_content);

            // tekitan delete nupu
            var delete_span = document.createElement('span');
            delete_span.appendChild(document.createTextNode(' kustuta'));

            delete_span.style.color = 'red';
            delete_span.style.cursor = 'pointer';

            // panen külge id
            // <span data-id="0">kustuta</span>
            delete_span.setAttribute('data-id', this.id);

            // lisan kuulari, kui keegi seda nuppu vajutab, et mis siis juhtub
            delete_span.addEventListener('click', Moosipurk.instance.deleteJar.bind(Moosipurk.instance));

            li.appendChild(delete_span);

            return li;

        }
    };

    // kui leht laetud käivitan Moosipurgi rakenduse
    window.onload = function(){
        var app = new Moosipurk();
    };

})();
