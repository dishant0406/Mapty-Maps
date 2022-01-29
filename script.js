'use strict';




const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');



class Workout{

  date = new Date();
  id = (Date.now() + '').slice(-10);
  


  constructor(coords, distance, duration){

    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    
    
  }

  _discriptionString(){
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.discString = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }

  
  
}



class Running extends Workout {

  type='running';

  constructor(coords, distance, duration, cadence){

    super(coords, distance, duration);

    this.cadence = cadence;

    this._calcpace();

    this._discriptionString();
  }

  _calcpace(){
    // min/km

    this.pace = this.duration/this.distance;
    return this.pace;
  } 
}



class Cycling extends Workout {

  type='cycling';

  constructor(coords, distance, duration, elevationGain){

    super(coords, distance, duration);

    this.elevationGain = elevationGain;

    this._calspeed();

    this._discriptionString();
  }

  _calspeed(){
    // min/km
    
    this.speed = this.distance/(this.duration/60);
    return this.speed;
  } 
}


//APP CLASS
class App{

  #map; 
  #mapevent;

  //Workout Array
  #workout = [];

  constructor(){

    this._getPosition();

    form.addEventListener('submit', this._newWorkOut.bind(this));

    //TOGGLING THE DISTANCE AND CADENCE ACCORDING TO THE WORKOUT
    inputType.addEventListener('change', this._toggleElevationField );

    containerWorkouts.addEventListener('click', this._movetopop.bind(this));

    //restore local storage items
    this._restoreLocalStorage();

  }

  _getPosition() {
        
    //GEOLOCATION API FOR GETTING LOCATION
    navigator.geolocation.getCurrentPosition(this._loadMap.bind(this) ,function(){

      //FUNCTION WHEN LOCATION CANNOT BE ACCESSED
      alert('CANNOT GET LOCATION');

    });
  
  }

  _loadMap(position) {

      //FIRST FUNCTION WHEN THE LOCATION IS ACCESSED SUCCESSFULLY

      //LATITUDE
      const latitude = position.coords.latitude;

      //LONGITUTDE
      const longitude = position.coords.longitude;


      //ARRAY TO STORE LONGITUDE AND LATITUDE
      const cords = [latitude, longitude];


      //LEAFLET MAP FUNCTION WHICH WILL SHOW THE MAP IN THE DIV WITH ID map
        this.#map = L.map('map').setView(cords, 13);


        //GOOGLE MAPS LOCATION TITLELAYER
        L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(this.#map);


          //SETTING A MARKER ON THE CLICK LOCATION  
          this.#map.on('click', this.showForm.bind(this));


          //render on side pane
    this.#workout.forEach(w => {
      this._renderWorkoutMarker(w);
    });
    
  }

  showForm(e) {
       
      //SETTING e to mapEvent
      this.#mapevent = e;

      //SETTING THE FORM VISIBLE AFTER CLICKING ON THE MAP
      form.classList.remove('hidden');

      //GETTING THE BLIINKING CURSOR ON INPUT FIELD
      inputDistance.focus();

  }

  hideForm() {
       
    //EMPTY THE INPUT FIELD
    inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value = '';


    //FORM DISPLACE TO NONE
    form.style.display = 'none';
    
    //SETTING THE FORM VISIBLE AFTER CLICKING ON THE MAP
    form.classList.add('hidden');

    //PUT BACK AFTER ANIMATION IS FINISHED
    setTimeout(()=> form.style.display ='grid', 1000);

}

  _toggleElevationField() {

      inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden');

  }

  _newWorkOut(e) {

      e.preventDefault();

      //GET DATA FROM THE FORM
      const type = inputType.value;
      const distance = +inputDistance.value;
      const duration = +inputDuration.value;
      let workouts;

      
        /*----------  CORRDINATES  ----------*/
        
        //LATITUDE OF THE CLICKED LOCATION
        const templat = this.#mapevent.latlng.lat;
      

        //LONGITUDE OF THE CLICKED LOCATION
        const templng =this.#mapevent.latlng.lng;
      

        //STORING THEM IN AN ARRAY
        const tempcords = [templat, templng];

        /*----------  CORRDINATES  ----------*/

  
      
          /*----------  HELPER FUNCTIONS  ----------*/

          const checknumber = (...inputs) => inputs.every(inp => Number.isFinite(inp));

          const checkpositive = (...inputs) => inputs.every(inp => inp>0);
          
          /*----------  HELPER FUNCTIONS  ----------*/


      //CHECK IF DATA IS VALID OR NOT


      //IF WORKOUT RUNNING CREATE RUNNING OBJECT
      if(type === 'running'){

        const cadence = +inputCadence.value;

        //CHECKING THE ENTERIES
        if(!checknumber(distance, duration, cadence) || !checkpositive(distance, duration, cadence)){
          return alert("Input needs to a Number and Positive!");
        }

        //creating and pushing a new workout
        workouts = new Running(tempcords, distance, duration, cadence);
        
      }

      //IF WORKOUT CYCLING CREATE CYCLING OBJECT
      if(type === 'cycling'){

        const elevation = +inputElevation.value;


        //CHECKING THE ENTERIES
        if(!checknumber(distance, duration, elevation) || !checkpositive(distance, duration)){
          return alert("Input needs to a Number and Positive!");
        }

        //creating and pusing the workout
        workouts = new Cycling(tempcords, distance, duration, elevation);
        

      }
      
      //PUSING THE WORKOUT IN THE ARRAY DEFINED IN THE ARRAY CLASS
      this.#workout.push(workouts);
      console.log(workouts);
      console.log(this.#workout);

      //RENDER WORKOUT MARKER ON THE MAP
      this._renderWorkoutMarker(workouts);

      //RENDERING ON SIDE PANE
      this._renderWorkoutOnPane(workouts);

      
      //HIDE FORM
      this.hideForm();

      //store data in the local storage
      this._storeLocalStorage();
    
  }


  //FUNCTION TO RENDER WORKOUT ON THE MAP
  _renderWorkoutMarker(workouts){
    //CREATING A MARKER FOR CLICKED LOCATION
    L.marker(workouts.coords).addTo(this.#map)

    //EDITING THE POPUP 
    .bindPopup(L.popup({
      maxWidth: 200,
      minWidth: 100,
      closeButton: false,
      autoClose: false,
      closeOnClick: false,
      className: `${workouts.type}-popup`,
  
    })
    .setContent(`${workouts.type === 'running' ? '🏃‍♂️' :' 🚴‍♂️'} ${workouts.discString}`))//SETTING CONTENT OF ON THE MARKER
  
    .openPopup();
  }

  _renderWorkoutOnPane(workouts){

    let html = 
    `<li class="workout workout--${workouts.type}" data-id="${workouts.id}">
    <h2 class="workout__title">${workouts.discString}</h2>
    <div class="workout__details">
      <span class="workout__icon">${workouts.type === 'running' ? '🏃‍♂️' :' 🚴‍♂️'}</span>
      <span class="workout__value">${workouts.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workouts.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;


    if(workouts.type==='running'){

      html+=`
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workouts.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workouts.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    }


    if(workouts.type ==='cycling'){
        html+= `<div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workouts.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workouts.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
      </li>`;
    }

    form.insertAdjacentHTML('afterend', html);



  }

  _movetopop(e){
      const workoutel = e.target.closest('.workout');
      

      if(workoutel===null){
        return;
      }

      const workout = this.#workout.find(work => work.id === workoutel.dataset.id);
      

      //SET VIEW ON THE MAP WITH LEAFTY
      this.#map.setView(/*cordinates first*/ workout.coords, /*zoomlevel*/ 14, /*opject of options*/ {
        animate: true,
        pan:{
          duration: 1
        }
      })
      

      
  }


  //FUNCTION TO STORE DATA IN THE LOCAL STORAGE USING LOCAL STORAGE API
  _storeLocalStorage(){

    //local storage api
    localStorage.setItem('storedWorkout', JSON.stringify(this.#workout));
  }

  _restoreLocalStorage(){

    //store the data from local storage to an array
    const data = JSON.parse(localStorage.getItem('storedWorkout'));

    //no data then return
    if(!data) {return;}

    //setting #workout to data
    this.#workout = data;

    //render on side pane
    this.#workout.forEach(w => {
      this._renderWorkoutOnPane(w);
    });
  }

  reset(){

    //reset the local storage
    localStorage.removeItem('storedWorkout');
    location.reload();
  }
}


const app = new App();