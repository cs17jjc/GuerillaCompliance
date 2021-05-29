///Parent class for turrets
///type provides type of turret, which should contain 'damage', 'firingSpeed', and 'bulletSpeed'
class Turret {
    constructor(type, damage, firingSpeed, bulletSpeed, accuracy, range) {
        this.type = type
        this.damage = damage
        this.firingSpeed = firingSpeed
        this.bulletSpeed = bulletSpeed
        this.accuracy = accuracy
        this.range = range;
    }
    static standardTurret() {
        return new Turret("STANDARD", 1, 50, 1, 0.8, 20);
    }
    static sniperTurret() {
        return new Turret("SNIPER", 2, 150, 2, 1, 50);
    }
}