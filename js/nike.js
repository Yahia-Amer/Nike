let carsouel = document.querySelector("#lio-carousel"),
    nextSliderBtn = carsouel.querySelector("#lio-carousel .next"),
    prevSliderBtn = carsouel.querySelector("#lio-carousel .prev"),
    navLinks=document.querySelectorAll(".navbar .sections .nav-link"),
    sizeButtons=document.querySelectorAll(".latest .item .desc .size ul button"),
    addButton=document.querySelectorAll(".latest .item .desc"),
    shoeChange=document.querySelectorAll(".latest .item .prespective .img img"),
    circles=document.querySelectorAll(".featured .products .item .circles li button"),
    shoeGallery=document.querySelectorAll(".featured .products .item .img img");


 


    window.addEventListener("load", () => {
    let startWindow2 =carsouel.querySelector(".lio-carousel-item"),
        startWindow1 = carsouel.querySelector(".lio-carousel-item .part1 .item");
        startWindow1.classList.add("start");
        startWindow2.classList.add("active");
        let icon = document.querySelector('link[rel="icon"]');
            icon.href = "img/logo.png";
        navLinks[0].classList.add("active");
        let nav=document.querySelector(".nav");
        if(scrollY>0)
            nav.style.opacity=1;
        else
            nav.style.opacity=0.8;
    } 
)


let burger = document.querySelector(".burger");
let navItems = document.querySelector(".nav-items");
if (window.innerWidth >= 992) {
     navItems.classList.remove("show");
 }


    burger.addEventListener("click", function () {  
                navItems.classList.toggle("show");
                });


    navLinks.forEach(link => {
    link.addEventListener("click", function () {
        navLinks.forEach(l => l.classList.remove("active"));
        this.classList.add("active");

    });
    });

    let regestOverlay=document.querySelector(".overlayReg"),
    regestIcon=document.querySelector(".nav .nav-items .func .reg "),
    regest=document.querySelector(".overlayReg .regest"),
    xR=document.querySelector(".overlayReg .regest .x");


    xR.addEventListener("click",function(){
        regestOverlay.classList.toggle("show");
    })
        regestIcon.addEventListener("click", function () {  
                regestOverlay.classList.toggle("show");
            });
const userName = document.querySelector("#userName");
const password = document.querySelector("#password");
const loginButton = document.querySelector(".done");

const lengthRule = document.querySelector("#length");
const upperRule = document.querySelector("#upper");
const lowerRule = document.querySelector("#lower");
const numberRule = document.querySelector("#number");

const userRegex = /^[a-zA-Z][a-zA-Z0-9_ ]{2,19}$/;

let validUser = false;
let validPassword = false;

userName.addEventListener("input", function(){

    validUser = userRegex.test(userName.value);

    if(validUser){
        userName.style.border = "2px solid green";
    }else{
        userName.style.border = "2px solid red";
    }

    checkForm();

});

password.addEventListener("input", function(){

    const value = password.value;

    let hasLength = value.length >= 8;
    let hasUpper = /[A-Z]/.test(value);
    let hasLower = /[a-z]/.test(value);
    let hasNumber = /\d/.test(value);

    updateRule(lengthRule, hasLength, "At least 8 characters");
    updateRule(upperRule, hasUpper, "One uppercase letter");
    updateRule(lowerRule, hasLower, "One lowercase letter");
    updateRule(numberRule, hasNumber, "One number");

    validPassword =
        hasLength &&
        hasUpper &&
        hasLower &&
        hasNumber;

    if(validPassword){
        password.style.border = "2px solid green";
    }else{
        password.style.border = "2px solid red";
    }

    checkForm();

});

function updateRule(element, valid){

    const icon = element.querySelector("i");

    if(valid){

        element.classList.add("valid");
        element.classList.remove("invalid");

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-check");

    }else{

        element.classList.add("invalid");
        element.classList.remove("valid");

        icon.classList.remove("fa-check");
        icon.classList.add("fa-xmark");

    }

}

function checkForm(){

    if(validUser && validPassword){
        loginButton.disabled = false;
        loginButton.style.opacity = "1";
        loginButton.style.cursor = "pointer";
    }
    else{
        loginButton.disabled = true;
        loginButton.style.opacity = ".5";
        loginButton.style.cursor = "not-allowed";
    }

}

loginButton.addEventListener("click", function () {

    regestOverlay.classList.remove("show");
    successOverlay.classList.add("show");

});
const successOverlay = document.querySelector(".overlaySuccess");
const okButton = document.querySelector(".overlaySuccess .ok");

okButton.addEventListener("click", function () {
    successOverlay.classList.remove("show");
});
    let cartOverlay=document.querySelector(".overlay"),
    cartIcon=document.querySelector(".nav .nav-items .func .shop"),
    cartBox=document.querySelector(".overlay .cart"),
    cartButton=document.querySelector(".overlay .cart .buy"),
    xIcon=document.querySelector(".overlay .cart .x"),
    div=cartBox.querySelector("div");


    xIcon.addEventListener("click",function(){
        cartOverlay.classList.toggle("show");
    })
        cartIcon.addEventListener("click", function () {  
                cartOverlay.classList.toggle("show");
                if(cartBox.classList.contains("no")){
                    cartButton.style.display="none";
                    div.style.display="block";
                }
                else{
                 cartButton.style.display="block";
                    div.style.display="none";   
                }
            
            });





    nextSliderBtn.addEventListener("click", function (e) {
        let currentSlider = carsouel.querySelector(".lio-carousel-item.active"),
        nextSlider=currentSlider.nextElementSibling??carsouel.querySelector(".lio-carousel-item:first-child"),
        currentPart1Start = carsouel.querySelector(".lio-carousel-item .part1 .item.start");

        currentSlider.classList.remove("active");
        nextSlider.classList.add("active");
        let nextPart1Start = nextSlider.querySelector(".part1 .item");
        currentPart1Start.classList.remove("start");
        nextPart1Start.classList.add("start");
        let inneerLogo1=document.querySelector(".inner-logo1"),
         inneerLogo2=document.querySelector(".inner-logo2");

        if(nextSlider.classList.contains("red")){
           document.documentElement.style.setProperty("--main-color","var(--first-color)");
            let logo= document.querySelector(".navbar.nav img");
            logo.src="img/logo.png";
            let icon = document.querySelector('link[rel="icon"]');
            icon.href = "img/logo.png";
            inneerLogo1.src="img/first-correct.png";
            inneerLogo2.src="img/first-correct.png";
        }
        else if(nextSlider.classList.contains("blue")){
           document.documentElement.style.setProperty("--main-color","var(--secund-color)");
             let logo= document.querySelector(".navbar.nav img");
            logo.src="img/logo2.png"
            let icon = document.querySelector('link[rel="icon"]');
            icon.href = "img/logo2.png";
            inneerLogo1.src="img/second-correct.png";
            inneerLogo2.src="img/second-correct.png";
        }
        else{
           document.documentElement.style.setProperty("--main-color","var(--third-color)");
             let logo= document.querySelector(".navbar.nav img");
            logo.src="img/logo3.png"
            let icon = document.querySelector('link[rel="icon"]');
            icon.href = "img/logo3.png";
            inneerLogo1.src="img/third-correct.png";
            inneerLogo2.src="img/third-correct.png";
        }

    });

    prevSliderBtn.addEventListener("click",function(e){
        let curentSlider = carsouel.querySelector(".lio-carousel-item.active"),
        prevSlider = curentSlider.previousElementSibling??carsouel.querySelector(".lio-carousel-item:last-child"),
        currentPart1Start = carsouel.querySelector(".lio-carousel-item .part1 .item.start");
        curentSlider.classList.remove("active");
        currentPart1Start.classList.remove("start");
        prevSlider.classList.add("active");
        let prevPart1Start = prevSlider.querySelector(".part1 .item");
        prevPart1Start.classList.add("start");


        if(prevSlider.classList.contains("red")){
           document.documentElement.style.setProperty("--main-color","var(--first-color)");
            let logo= document.querySelector(".navbar.nav img");
            logo.src="img/logo.png"
            let icon = document.querySelector('link[rel="icon"]');
            icon.href = "img/logo.png";
        }
        else if(prevSlider.classList.contains("blue")){
           document.documentElement.style.setProperty("--main-color","var(--secund-color)");
             let logo= document.querySelector(".navbar.nav .logo");
           logo.src="img/logo2.png"
           let icon = document.querySelector('link[rel="icon"]');
            icon.href = "img/logo2.png";
        }
        else{
           document.documentElement.style.setProperty("--main-color","var(--third-color)");
             let logo= document.querySelector(".navbar.nav img");
            logo.src="img/logo3.png"
            let icon = document.querySelector('link[rel="icon"]');
            icon.href = "img/logo3.png";
        }

    });

    shoeChange.forEach(s => {
        s.addEventListener("click",function (e){
        
             let item=s.closest(".item"),
             shoe=item.querySelector(".shoe img");
            shoe.src=s.src;                
            })
        });


sizeButtons.forEach(button => {

    button.addEventListener("click", function () {
        let item = this.closest(".item")
        let buttons = item.querySelectorAll(".size button");
        buttons.forEach(btn => {
            btn.classList.remove("select");
        });
        this.classList.add("select");
    });

});

addButton.forEach(element => {
    let item =element.closest(".item"),
    addItem=item.querySelector(".add-cart");

    addItem.addEventListener("click",function(e){
        if(addItem.classList.contains("add")){
            addItem.classList.remove("add");
            addItem.classList.add("remove");
            addItem.textContent="Remove From cart";
                }
                
                else if(addItem.classList.contains("remove")){
                    addItem.classList.remove("remove");
                    addItem.classList.add("add");        
                    addItem.textContent="Add To cart";
                }

    })

})



circles.forEach(element=>{
    element.addEventListener("click",function(e){
        let item=element.closest(".item"),
        img=item.querySelector(".img img");
        circle=item.querySelectorAll("li button");
        circle.forEach(c=>{
            c.classList.remove("select");
        })
        this.classList.add("select");
        let currentImg=item.querySelector("li button.select img");
        img.src=currentImg.src;
    })
})  

