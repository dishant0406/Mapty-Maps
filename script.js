'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
  
}



class Running extends Workout {

  type='running';

  constructor(coords, distance, duration, cadence){

    super(coords, distance, duration);

    this.cadence = cadence;

    this._calcpace();
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
    
  }

  showForm (e) {
       
      //SETTING e to mapEvent
      this.#mapevent = e;

      //SETTING THE FORM VISIBLE AFTER CLICKING ON THE MAP
      form.classList.remove('hidden');

      //GETTING THE BLIINKING CURSOR ON INPUT FIELD
      inputDistance.focus();

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

      //EMPTY THE INPUT FIELD
      inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value = '';
    
    
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
    .setContent(workouts.distance +''))//SETTING CONTENT OF ON THE MARKER
  
    .openPopup();
  }
}


const app = new App();