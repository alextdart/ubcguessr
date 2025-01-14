import React from "react";
import "../styles.css"; 

const About = () => {
    return (
        <div className="about-page">
            <h1>About UBCguessr</h1>
            <p>This game was created by Alex Dart mostly for fun, and JavaScript practice.</p>
            <p>It's inspired by <a href="https://www.geoguessr.com/">Geoguessr</a> and <a href="https://timeguessr.com/">Timeguessr</a> but focuses on the UBC campus.</p>
            <p>Feel free to check out the code on my <a href="https://github.com/alextdart/ubcguessr">GitHub</a>.</p>

            <hr></hr>

            <h2>How to Play</h2>
            <p>Each round, you'll be shown an image taken somewhere on the UBC campus. Your goal is to guess where the image was taken by placing a pin on the map.</p>
            <p>The game lasts five rounds and at the end you'll be shown your total score along with a map of all your guesses.</p>
            <p>Good luck!</p>

            <hr></hr>

            <h2>Do you have images you want to submit to this game?</h2>
            <p>As long as your images have location data attached, or you can provide me the lat/long coordinates otherwise, feel free to submit them to the link below.</p>
            <p><a href="https://forms.gle/VGJkcbq5drSHdeZL6">Google Form Survey Link</a></p>

            <hr></hr>

            <h2>Cheers to all Image Contributors:</h2>
            <p>Matt B., Emily D., Mikey L., Davey R., Michael M., Guillermo, Kumar R., Rain, Eric S., EJ F., Andy C., Ardian A., Zaagi, Griffin V., Moses L. (and those who didn't want credit)</p>
        </div>
    );
};

export default About;
