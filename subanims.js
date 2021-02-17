
var fps = 60.0;
var Suc=[0.0, 1.0, 0.0];
var Fai=[1.0, 0.0, 0.0];

class SubAnim {
    constructor(timeLimit) {
        this.timeLimit = timeLimit;
        this.cooldown = fps;
        this.timer = 0;
        this.speed = 1;
    }

    step() {
        if (this.timer>=this.timeLimit+this.cooldown) return true;
        this.timer+=this.speed;
        return false;
    }

    reset() {
        this.timer=0;
        this.speed=1;
    }
    restore() {}
}

class Move extends SubAnim {
    constructor(obj, src, dst) {
        super(Math.ceil(fps*0.6));
        this.cooldown = Math.ceil(fps*0.7);

        this.obj = obj;
        this.src = src;
        this.dst = dst;

        this.vx0=(this.dst[0]-this.src[0])/(5*this.timeLimit);
        this.vz0=(this.dst[2]-this.src[2])/(5*this.timeLimit);


        this.ax = (this.dst[0]-this.src[0]-this.timeLimit*this.vx0)*2/(this.timeLimit*this.timeLimit);
        this.az = (this.dst[2]-this.src[2]-this.timeLimit*this.vz0)*2/(this.timeLimit*this.timeLimit);

        this.reset();
    }

    step() {
        var end = super.step();
        if (this.timer>=this.timeLimit) {
            this.obj.tx=this.dst[0];
            this.obj.tz=this.dst[2];
            return end;
        }

        this.obj.tx=this.src[0]+this.vx0*this.timer+0.5*this.ax*(this.timer*this.timer);
        this.obj.tz=this.src[2]+this.vz0*this.timer+0.5*this.az*(this.timer*this.timer);

        return end;
    }
    reset() {
        super.reset();
        this.restore();
        this.vx = this.vx0;
        this.vz = this.vz0;
    }
    restore() {
        this.obj.tx=this.src[0];
        this.obj.ty=this.src[1];
        this.obj.tz=this.src[2];
    }
}

class New extends SubAnim {
    constructor(obj, dst) {
        super(Math.ceil(fps*0.6));
        this.cooldown = Math.ceil(fps*0.7);

        this.obj = obj;
        this.dst = dst;

        // Time Marks
        this.hitMark=Math.ceil(this.timeLimit*0.6);
        this.rockDur=Math.ceil(this.timeLimit-this.hitMark);

        this.rockValue = 5;

        this.h = 10.0;
        this.vy0 = (0.01-this.h)/this.hitMark;
        this.vy = this.vy0;

        this.reset();
    }

    step() {
        var end = super.step();
        if (this.timer>=this.timeLimit) {
            if (this.timer>=this.timeLimit) {
                this.obj.rz=0;
            }
            return end;
        }

        if (this.timer<=this.hitMark) this.obj.ty=this.h+this.vy*this.timer;
        else {
            this.obj.ty=0.01;
            var t = this.timer-this.hitMark;
            if (t<=this.rockDur/3) {
                this.obj.rz=t*(this.rockValue/(this.rockDur/3));
            }
            else if (t<=2*this.rockDur/3) {
                var tt=t-t/3;
                this.obj.rz=tt*((-this.rockValue/2-this.rockValue)/(this.rockDur/3));
            }
            else if (t<this.rockDur-1) {
                var tt=t-2*t/3;
                this.obj.rz=tt*((-this.rockValue/2)/(this.rockDur/3));
            }
            else this.obj.rz=0;
        }

        return end;
    }
    reset() {
        super.reset();
        this.obj.ty=this.h;
    }
    restore() {
        this.obj.ty=0.01;
    }
}

class Remove extends SubAnim {
    constructor(obj) {
        super(Math.ceil(fps));
        this.cooldown = Math.ceil(fps/2);

        this.obj = obj;

        // Time Marks
        this.t1 = this.timeLimit*0.30;
        this.t2 = this.timeLimit*0.60;

        this.v0 = 4.0/fps;
        var vf = 75.0/fps;

        this.a0 = -this.v0/this.t1;
        var v2 = this.v0+this.a0*this.t2;
        this.a2 = (vf-v2)/(this.timeLimit-this.t2);
        this.v02 = v2-this.a2*this.t2;
        var y2 = this.v0*this.t2+0.5*this.a0*(this.t2*this.t2);
        this.y02 = y2-(this.v02*this.t2+0.5*this.a2*(this.t2*this.t2));

        this.reset();
    }

    step() {
        var end = super.step();
        if (this.timer>=this.timeLimit) {
            this.obj.draw=false;
            return end;
        }

        if (this.timer<this.t2) this.obj.ty=this.v0*this.timer+0.5*this.a0*(this.timer*this.timer);
        else this.obj.ty=this.y02+this.v02*this.timer+0.5*this.a2*(this.timer*this.timer);

        return end;
    }
    reset() {
        super.reset();
        this.restore();

        this.vy=this.v0;
        this.obj.ty=0.01;
    }
    restore() {
        this.obj.ty=0.01;
        this.obj.draw=true;
    }
}

class Confict extends SubAnim {
    constructor(queenPos,conflicts,squares) {
        super(Math.ceil(fps/2));
        this.cooldown = Math.ceil(fps/2);

        this.queenPos = queenPos;
        this.conflicts = conflicts;
        this.squares = squares;

        this.reset();
    }

    step() {
        var end = super.step();
        if (end) this.squares.splice(0,this.squares.length);
        if (this.timer>=this.timeLimit) {
            if (this.timer==this.timeLimit) {
                for (const sq of this.squares) sq.draw = true;
            }
            return end;
        }

        if (this.timer%10==0) {
            for (const sq of this.squares) sq.draw = !sq.draw;
        }

        return end;
    }
    reset() {
        super.reset();
        for (const pos of this.conflicts) {
            var sq = new Object();
            sq.model = squareM;
            sq.tx = pos[0];
            sq.ty = 0.005;
            sq.tz = pos[1];
            sq.draw=true;
            this.squares.push(sq);
        }
        squareM.primitives[0].difColor = Fai;
    }
    restore() {
        this.squares.splice(0,this.squares.length);
    }
}

class Success extends SubAnim {
    constructor(queens,squares) {
        super(Math.ceil(fps*1.5));
        this.cooldown=0;

        this.queens = queens;
        this.squares = squares;

        // (Co)Sine Wave Parameters
        this.amp=-0.4;
        this.ang=2*Math.PI/this.timeLimit;

        this.b=0.5;

        // Rotation Parameters
        this.rSpeed=90/this.timeLimit;

        this.reset();
    }

    step() {
        var end = super.step();
        if (end) this.squares.splice(0,this.squares.length);
        if (this.timer>=this.timeLimit) return end;

        for (const q of this.queens) {
            q.ty = this.amp*Math.cos(this.ang*this.timer)+this.b;
            q.ry = this.rSpeed*this.timer;
        }

        return end;
    }
    reset() {
        super.reset();
        for (const q of this.queens) {
            var sq = new Object();
            sq.model = squareM;
            sq.tx = q.tx;
            sq.ty = 0.005;
            sq.tz = q.tz;
            sq.draw=true;
            this.squares.push(sq);
        }
        squareM.primitives[0].difColor = Suc;
    }
    restore() {
        this.squares.splice(0,this.squares.length);
        for (const q of this.queens) {
            q.ty=0.01;
            q.ry=0;
        }
    }
}

function radians( degrees ) {
    return degrees * Math.PI / 180.0;
}

function minIndex(arr) {
    if (arr.length === 0) return -1;

    var min = arr[0];
    var minIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] < min) {
            minIndex = i;
            min = arr[i];
        }
    }

    return minIndex;
}

class Failure extends SubAnim{
    constructor(queens,N) {
        super(Math.ceil(fps));
        this.cooldown = Math.ceil(fps/2);
        
        this.queens = queens;

        this.alpha=0;
        this.rInc=30;
        this.h=1;

        this.vxx0=-6/this.timeLimit;
        this.vyy0=0.4;
        this.vyym=this.vyy0*1.5;
        this.vyy=this.vyy0;
        this.ayy=-0.02;

        this.ogPos=[];
        this.dirs=[];
        var side=N/2;
        for (const q of this.queens) {
            this.ogPos.push([q.tx,q.tz]);
            this.dirs.push(minIndex([side+q.tx, side-q.tz, side-q.tx, side+q.tz]));
        }

        this.reset();
    }

    step() {
        var end = super.step();
        if (this.timer>=this.timeLimit) {
            if (this.timer==this.timeLimit) {
                for (const q of this.queens) q.draw=false;
            }
            return end;
        }

        // Rotation
        this.alpha=(this.rInc*this.timer)%360;
        var rxx=this.h*Math.sin(radians(this.alpha));
        var ryy=-this.h*Math.cos(radians(this.alpha))+this.h;

        // Translation
        if (this.vyy<this.vyym) this.vyy=this.vyy0+this.ayy*this.timer;
        var txx=this.vxx0*this.timer;
        var tyy=this.vyy*this.timer;

        for (var i=0;i<this.queens.length;i++) {
            switch(this.dirs[i]) {
            case 0: // LEFT
                this.queens[i].rz=this.alpha;
                this.queens[i].tx=this.ogPos[i][0]+rxx+txx;
                this.queens[i].ty=ryy+tyy;
            break;
            case 1: // FRONT
                this.queens[i].rx=this.alpha;
                this.queens[i].tz=this.ogPos[i][1]-rxx-txx;
                this.queens[i].ty=ryy+tyy;
            break;
            case 2: // RIGHT
                this.queens[i].rz=-this.alpha;
                this.queens[i].tx=this.ogPos[i][0]-rxx-txx;
                this.queens[i].ty=ryy+tyy;
            break;
            case 3: // BACK
                this.queens[i].rx=-this.alpha;
                this.queens[i].tz=this.ogPos[i][1]+rxx+txx;
                this.queens[i].ty=ryy+tyy;
            break;
            }
        }

        return end;
    }
    reset() {
        super.reset();
        this.alpha=0;
        this.vyy=this.vyy0;
        this.restore();
    }
    restore() {
        for (var i=0;i<this.queens.length;i++) {
            this.queens[i].tx=this.ogPos[i][0];
            this.queens[i].ty=0.01;
            this.queens[i].tz=this.ogPos[i][1];
            this.queens[i].rx=0.0;
            this.queens[i].rz=0.0;

            queens[i].draw=true;
        }
    }
}
