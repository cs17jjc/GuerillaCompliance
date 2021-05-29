///Parent class for turrets
///type provides type of turret, which should contain 'damage', 'firingSpeed', and 'bulletSpeed'
class Turret{
    constructor(type,pos,data)
    {
        this.type = type
        this.position = pos
        this.data = data
        this.damage = type.damage
        this.firingSpeed = type.firingSpeed
        this.bulletSpeed = type.bulletSpeed
        this.accuracy = type.accuracy
    }
}