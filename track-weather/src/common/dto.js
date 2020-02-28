module.exports = {
    WeatherInfo: class {
        constructor(coord, day, tDay, tNight, tMin, tMax, Hum, Pres, Speed) {
            this.coord = coord; 
            this.day = day;
            this.tDay = tDay;
            this.tNight = tNight
            this.tMin = tMin
            this.tMax = tMax
            this.Hum = Hum
            this.Pres = Pres
            this.Speed = Speed
        }
    }
}