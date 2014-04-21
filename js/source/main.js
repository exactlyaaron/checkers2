(function(){

  'use strict';

  $(document).ready(init);

  var selectedPlayer;
  var selectedSigil;
  var player1Sigil;
  var player2Sigil;

  var origin;
  var destination;


  function init(){
    $('#players div').click(choosePlayer);
    $('.sigil > img').click(addSigil);
    $('#start').click(startGame);
    $('#reload, #reload2').click(reload);

    $('#board').on('click', 'td.valid.checker.current', select);
    $('#board').on('click', 'td.valid:not(.checker)', move);
  }

  function choosePlayer(){
    $('.choose').removeClass('choose');
    $(this).addClass('choose');
    selectedPlayer = $(this);
  }

  // adds sigil image to player selection
  function addSigil(){
    selectedSigil = $(this);

    // dont do anything if user clicks the already chosen thing again
    if(selectedPlayer.hasClass('chosen')){
      return;

    } else {
      // appends image to the choose div
      $('.choose #img').append($(this));
      // removes the choose status
      $('.choose').removeClass('choose');
      // locks in the choice with a chosen class
      $(selectedPlayer).addClass('chosen');
    }

    // if only one chosen then add first sigil continue picking
    if ($('.chosen').length === 1){
      player1Sigil = $(selectedSigil).attr('src');
      player1Sigil = player1Sigil.split('../media/pieces/');

    // if two are chosen then add the second and run showStart function
    } else if ($('.chosen').length === 2){
      player2Sigil = $(selectedSigil).attr('src');
      player2Sigil = player2Sigil.split('../media/pieces/');
      $('.choose').removeClass('choose');
      showStart();
    }
  }

  // remove sigils and confirm the game start
  function showStart(){
    $('#choose-sigil, #reload2').toggleClass('hide');
    $('#start, #reload').toggleClass('hide');
    $('.chosen').off('click');
  }

  // hide all the choosies and show game board
  function startGame(){
    $('#players, #start, #board, #reload').toggleClass('hide');
    setBoard();
  }

  // reload page to choose new houses
  function reload(){
    location.reload();
  }

  // builds board with called variables from sigil file name arrays
  function setBoard(){
    var $team2 = $('td.valid[data-y=0], td.valid[data-y=1], td.valid[data-y=2]');
    var $team1 = $('td.valid[data-y=5], td.valid[data-y=6], td.valid[data-y=7]');

    // for loop to add images to each team
    for(var i=0; i < $team1.length; i++){
      var $team1Piece = $('<img>').attr('src', './media/pieces/' + player1Sigil[1]);
      var $team2Piece = $('<img>').attr('src', './media/pieces/'+ player2Sigil[1]);

      $($team1[i]).append($team1Piece);
      $($team1[i]).addClass('checker').addClass('player1').addClass('current');

      $($team2[i]).append($team2Piece);
      $($team2[i]).addClass('checker').addClass('player2');
    }
  }

  //  function when piece is chosen
  function select(){

    if(origin){
      origin.removeClass('selected');
    } // removes class if anything already has class 'selected'

    // store clicked piece in a variable
    var $target = $(this).addClass('selected');
    origin = $target;
  }

  // function to determine the places that moving piece can or will go
  function move(){
    destination = $(this);

    // store coordinates of starting location
    var originX = origin.data('x');
    var originY = origin.data('y');

    // store cooridinates of new location
    var destinationX = destination.data('x');
    var destinationY = destination.data('y');

    // variable array for difference of the places
    var vector = [];
    vector.push(destinationX - originX);
    vector.push(destinationY - originY);

    // if difference is one place do this
    if(Math.abs(vector[0]) + Math.abs(vector[1]) === 2){
      if(direction(origin, destination)){
        movePiece();
        endTurn();
      }
    // if difference is two places do this
    } else if(Math.abs(vector[0]) + Math.abs(vector[1]) === 4){

      // run function in if condition with those arguments (only runs if returns true)
      if(direction(origin, destination)){

        //generates deadPiece by calling function generateDead with those arguments
        var $deadPiece = generateDead(origin, destination);

        // if checkDead function with $deadPiece argument returns true perform execution
        if(checkDead($deadPiece)){
          //debugger;
          $deadPiece.empty();
          $deadPiece.removeClass('checker');
          destination.addClass('current');

          movePiece();

          if(checkPotential() > 3){
            endTurn();
          }
        }
      }
    }
  }

    // fucntion to find the direction of the moving piece and make sure its valid
    function direction(jQueryOrigin, jQueryDestination){
                      // arguments passed from move function
      //debugger;
      // king can move either direction
      if(jQueryOrigin.hasClass('king')){
        return true;
      }

      // checks move direction for player 1
      if (jQueryDestination.data('x') !== jQueryOrigin.data('x')) {
        if(jQueryOrigin.hasClass('player1')){

          // if destination has a lower Y value the function returns true to move function
          if(jQueryDestination.data('y') < jQueryOrigin.data('y')){
            return true;
          }else{
          return false;
          }

        // checks move direction for player 2
        }else{

          // if destination has a higher Y value the function returns true to move function
          if(jQueryDestination.data('y') > jQueryOrigin.data('y')){
            return true;
          }
          return false;
        }
      }

    }

    // function for changing the dom elements once move is made
    function movePiece(){

      // if destination td does not have a checker in it
      if(!destination.hasClass('checker')){
        var $token = origin.find('img');

        // empties the existing img from the td
        origin.empty();

        // append the selected image stored in token to destination td
        destination.append($token);

        // swap dem classes
        origin.removeClass('selected').removeClass('checker').removeClass('current');
        destination.addClass('checker').addClass('current');

        if(origin.hasClass('player1')){
          origin.removeClass('player1');
          destination.addClass('player1');

          // if destination is the top row add the kingsfoil (thats a weed)
          if(destination.data('y') === 0){
            destination.addClass('king');
            destination.empty();
            destination.append($('<img>').attr('src', './media/pieces/'+ 'king-' + player1Sigil[1]));
          }

        } else {

          origin.removeClass('player2');
          destination.addClass('player2');

          // if destination is the bottom row add the kingsfoil (thats a weed)
          if(destination.data('y') === 7){
            destination.addClass('king');
            destination.empty();
            destination.append($('<img>').attr('src', './media/pieces/'+ 'king-' + player2Sigil[1]));
          }
        }

        // allows for unselecting king
        if(origin.hasClass('king')){
          origin.removeClass('king');
          destination.addClass('king');
        }
      }
    }

    // returns true or false based on if deadpiece is a checker and is not on current team
    function checkDead(deadPiece){
      return deadPiece.hasClass('checker') && !deadPiece.hasClass('current');
    }

    // calculates deadpiece location by taking the average of origin and destination coordinates
    function generateDead(jQueryOrigin, jQueryDestination){
      var avgX = average(jQueryOrigin.data('x'), jQueryDestination.data('x'));
      var avgY = average(jQueryOrigin.data('y'), jQueryDestination.data('y'));
      return $('td[data-x=' + avgX + '][data-y=' + avgY +']');
    }

    function average(x,y){
      return (x+y)/ 2;
    }

    // swaps current on teams
    function endTurn(){
      var $currentPlayer = $('td.checker.current');
      var $otherPlayer = $('td.checker');

      $otherPlayer.addClass('current');
      $currentPlayer.removeClass('current');
    }

    function checkPotential(){
      var potentialTargets = [];
      var translatedX = [];
      var translatedY = [];

      translatedX.push(destination.data('x') + 2);
      translatedY.push(destination.data('y') + 2);
      translatedX.push(destination.data('x') - 2);
      translatedY.push(destination.data('y') - 2);


      for(var j=0; j<2; j++){
        for(var k=0; k<2; k++){
          potentialTargets.push($('td[data-x=' + translatedX[j] + '][data-y=' +translatedY[k] +']'));
        }
      }

      //prune occupied potentials;
      var spliceIndeces = [];
      for(var i=0; i<potentialTargets.length; i++){
        var $dead = generateDead(destination, potentialTargets[i]);
        if(potentialTargets[i].hasClass('checker') || !checkDead($dead) || !direction(destination, potentialTargets[i])){
          spliceIndeces.push(i);
        }
      }

      return spliceIndeces.length;
    }


})();
