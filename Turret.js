///Parent class for turrets
///type provides type of turret, which should contain 'damage', 'firingSpeed', and 'bulletSpeed'
class Turret {
    constructor(type, damage, cooldown, accuracy, range) {
        this.type = type;

        this.damage;
        this.cooldown;
        this.accuracy;
        this.range;

        this.baseDamage = damage;
        this.baseCooldown = cooldown;
        this.baseAccuracy = accuracy;
        this.baseRange = range;

        this.shotTimer = 0;
        this.canShoot = true;
        this.atributesUpdated = false;
    }
    static standardTurret() {
        //Low Damage - Medium Fire Rate - Low Radius
        return new Turret("STANDARD", 1, 25, 1, 0.8, 50);
    }
    static sniperTurret() {
        //High Damage - Low Fire Rate - High Radius
        return new Turret("SNIPER", 2, 50, 2, 1, 80);
    }
    static machineGunTurret() {
        //Low Damage - High Fire Rate - Medium Radius
        return new Turret("MACHINE_GUN", 1, 10, 2, 1, 70);
    }
    static laserTurret() {
        //High Damage - High Fire Rate - High Radius
        return new Turret("LASER", 2, 10, 2, 1, 80);
    }
}