// PlayCanvas player controller - simple prototype friendly script
// Attach to your player entity. Assumes Y-up world. No rigidbody required.

var PlayerController = pc.createScript('playerController');

PlayerController.attributes.add('speed', { type: 'number', default: 5 });
PlayerController.attributes.add('jumpSpeed', { type: 'number', default: 7 });
PlayerController.attributes.add('gravity', { type: 'number', default: -20 });

// initialize code called once per entity
PlayerController.prototype.initialize = function () {
    this.velocity = new pc.Vec3(0, 0, 0);
    this.grounded = false;
    this.touchDir = 0;

    // Simple keyboard helper - PlayCanvas provides app.keyboard
    this.keyboard = this.app && this.app.keyboard ? this.app.keyboard : null;

    // Bind touch handlers for simple mobile input (left/right half + tap to jump)
    var canvas = this.app.graphicsDevice.canvas;
    this._onTouchStart = this.onTouchStart.bind(this);
    this._onTouchEnd = this.onTouchEnd.bind(this);
    canvas.addEventListener('touchstart', this._onTouchStart);
    canvas.addEventListener('touchend', this._onTouchEnd);
};

// basic touch logic: left half -> move left, right half -> move right, quick tap -> jump
PlayerController.prototype.onTouchStart = function (e) {
    e.preventDefault();
    var x = e.touches[0].clientX;
    var w = window.innerWidth || document.documentElement.clientWidth;
    this.touchDir = x < w / 2 ? -1 : 1;
    // if single tap (no drag) we treat it as jump
    this._touchJump = true;
};

PlayerController.prototype.onTouchEnd = function (e) {
    e.preventDefault();
    // treat a quick tap as a jump
    if (this._touchJump && this.grounded) {
        this.velocity.y = this.jumpSpeed;
        this.grounded = false;
    }
    this.touchDir = 0;
    this._touchJump = false;
};

PlayerController.prototype.update = function (dt) {
    // read keyboard input (A/D or left/right)
    var moveX = 0;
    if (this.keyboard) {
        if (this.keyboard.isPressed(pc.KEY_A) || this.keyboard.isPressed(pc.KEY_LEFT)) moveX -= 1;
        if (this.keyboard.isPressed(pc.KEY_D) || this.keyboard.isPressed(pc.KEY_RIGHT)) moveX += 1;
        // jump on space (uses wasPressed so it only fires once per press)
        if (this.keyboard.wasPressed(pc.KEY_SPACE) && this.grounded) {
            this.velocity.y = this.jumpSpeed;
            this.grounded = false;
        }
    }

    // add touch direction
    if (this.touchDir !== 0) moveX += this.touchDir;

    // horizontal movement (world X axis). Adjust to your camera or local axes if needed.
    if (moveX !== 0) {
        var dx = moveX * this.speed * dt;
        this.entity.translate(dx, 0, 0);
    }

    // gravity + vertical movement (simple physics)
    this.velocity.y += this.gravity * dt;
    this.entity.translate(0, this.velocity.y * dt, 0);

    // ground check (simple prototype: assume ground at y = 0.5)
    var pos = this.entity.getPosition();
    if (pos.y <= 0.5) {
        pos.y = 0.5;
        this.entity.setPosition(pos);
        this.velocity.y = 0;
        this.grounded = true;
    }
};

// cleanup when script is removed/destroyed
PlayerController.prototype.destroy = function () {
    var canvas = this.app.graphicsDevice.canvas;
    canvas.removeEventListener('touchstart', this._onTouchStart);
    canvas.removeEventListener('touchend', this._onTouchEnd);
};
