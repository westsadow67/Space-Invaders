const canvas = document.querySelector("canvas");
const scoreEL = document.querySelector("#scoreEL");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player
{
    constructor()
    {
        this.position = {x:0, y:0};
        this.clickPosition = {x: canvas.width / 2, y: 0};
        this.velocity = {x:0, y:0};
        this.rotation = 0;
        this.opacity = 1;

        const image = new Image();
        image.src = "img/spaceship.png";
        image.onload = () =>
        {
            const scale = 0.15;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {x: canvas.width / 2 - this.width / 2, y: canvas.height - this.height - 20};
        }
    }

    draw()
    {
        //context.fillRect(this.position.x, this.position.y, this.width, this.height);
        context.save();
        context.globalAlpha = this.opacity
        context.translate(player.position.x + player.width / 2, player.position.y + player.height / 2);
        context.rotate(this.rotation);
        context.translate(-player.position.x - player.width / 2, -player.position.y - player.height / 2);
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        context.restore();
    }

    update()
    {
        if (this.image)
        {
            this.draw();
            this.position.x += this.velocity.x;
        }
    }
}

class Projectile
{
    constructor({position, velocity})
    {
        this.position = position;
        this.velocity = velocity;
        this.radius = 3;
    }

    draw()
    {
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = "red";
        context.fill();
        context.closePath();
    }

    update()
    {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class InvaderProjectile
{
    constructor({position, velocity})
    {
        this.position = position;
        this.velocity = velocity;

        this.width = 3;
        this.height = 10;
    }

    draw()
    {
        context.fillStyle = "white";
        context.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    update()
    {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Invader
{
    constructor({position})
    {
        this.velocity = {x: 0, y: 0};

        const image = new Image();
        image.src = "img/invader.png";
        image.onload = () =>
        {
            const scale = 1;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {x: position.x, y: position.y};
        }
    }

    draw()
    {
        //context.fillRect(this.position.x, this.position.y, this.width, this.height);
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    update({velocity})
    {
        if (this.image)
        {
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;;
        }
    }

    shoot(InvaderProjectiles)
    {
        InvaderProjectiles.push(new InvaderProjectile(
            {
                position: 
                {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height
                },
                velocity:
                {
                    x: 0,
                    y: 5
                }
            }))
    }
}

class Grid
{
    constructor()
    {
        this.position = {x: 0, y: 0};
        this.velocity = {x: 3, y: 0};
        this.spawnNums = {x: 3, y: 2};

        this.invaders = [];

        const columns = Math.floor(Math.random() * this.spawnNums.x + this.spawnNums.y);
        const rows = Math.floor(Math.random() * this.spawnNums.x + this.spawnNums.y);

        this.width = columns * 30;

        for (let x = 0; x < columns; x++)
        {
            for (let y = 0; y < rows; y++)
            {
                this.invaders.push(new Invader({position: {x: x * 30, y: y * 30}}));
            }
        }
    }

    update()
    {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.velocity.y = 0

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0)
        {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 30;
        }
    }
}

const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const keys = {a: {pressed:false}, d: {pressed:false}, space: {pressed:false}}

let frames = 0;
let randomInterval = Math.floor((Math.random() * 3000) + 500);
let isMoble = false;
let game = {over: false, active: true};
let score = 0;

function animate()
{
    if (!game.active) return
    requestAnimationFrame(animate);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.position.x  = player.clickPosition.x - player.width / 2;
    invaderProjectiles.forEach((invaderProjectile, index) => 
    {
        if (invaderProjectile.position.y + invaderProjectile. height >= canvas.height)
        {
            setTimeout(() => {invaderProjectiles.splice(index, 1)}, 0);
        }
        else
        {
            invaderProjectile.update();
        }

        if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y
            && invaderProjectile.position.x + invaderProjectile.width >= player.position.x
            && invaderProjectile.position.x <= player.position.x + player.width)
        {
            setTimeout(() => {invaderProjectiles.splice(index, 1)}, 0);
            player.opacity = 0;
            game.over = true;
            game.active = false;
            console.log("you lose");
        }
    })
    projectiles.forEach((projectile, index) => 
    {
        if (projectile.position.y + projectile.radius <= 0)
        {
            setTimeout(() => {projectiles.splice(index, 1)}, 0);
        }
        projectile.update();
    })

    grids.forEach((grid, gridIndex) => 
        {
            grid.update();
            if (frames % 100 == 0 && grid.invaders.length > 0)
            {
                grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
            }
            grid.invaders.forEach((invader, i) => 
            {
                invader.update({velocity: grid.velocity})
                projectiles.forEach((projectile, j) => 
                {
                    if (projectile.position.y - projectile.radius <= invader.position.y + invader.height
                        && projectile.position.x + projectile.radius >= invader.position.x
                        && projectile.position. x - projectile.radius <= invader.position.x + invader.width
                        && projectile.position.y + projectile.radius >= invader.position.y)
                    {
                        setTimeout(() => 
                        {
                            const invaderFound = grid.invaders.find(invader2 => 
                            {
                                return invader2 == invader
                            })
                            const projectileFound = projectiles.find(projectile2 => 
                            {
                                return projectile2 == projectile
                            })
                            if (invaderFound && projectileFound)
                            {
                                score += 100;
                                scoreEL.innerHTML = score;

                                grid.invaders.splice(i, 1);
                                projectiles.splice(j, 1);

                                if (grid.invaders.length > 0)
                                {
                                    const firstInvader = grid.invaders[0];
                                    const lastInvader = grid.invaders[grid.invaders.length - 1];

                                    grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                                    grid.position.x = firstInvader.position.x;
                                }
                                else
                                {
                                    grids.splice(gridIndex, 1);
                                }
                            }
                        }, 0)
                    }
                })
            });
        });

    if (keys.a.pressed && player.position.x >= 0)
    {
        player.velocity.x = -7;
        player.rotation = -0.15;
    }
    else if (keys.d.pressed && player.position.x + player.width <= canvas.width)
    {
        player.velocity.x = 7;
        player.rotation = 0.15;
    }
    else
    {
        player.velocity.x = 0;
        player.rotation = 0;
    }

    if (frames % randomInterval  == 0)
    {
        grids.push(new Grid());
        randomInterval = Math.floor((Math.random() * 3000) + 500);
        frames = 0;
    }

    frames++;
}

animate();

addEventListener("touchstart", (event) =>
{
    console.log(event);
    if (event)
    {
        isMoble = true;
    }

})

addEventListener("click", (event) =>
{
    if (game.over) return;

    if(isMoble)
    {
        player.clickPosition.x = event.clientX;
        projectiles.push(new Projectile({position: {x: player.position.x + player.width / 2, y: player.position.y}, velocity: {x: 0, y: -10}}))
    }
})

window.addEventListener("keydown", ({key}) => 
{
    if (game.over) return;

    switch (key)
    {
        case 'a': keys.a.pressed = true;
        break;
        case 'd': keys.d.pressed = true;
        break;
        case ' ': projectiles.push(new Projectile({position: {x: player.position.x + player.width / 2, y: player.position.y}, velocity: {x: 0, y: -10}}));
        break;
    }
})

window.addEventListener("keyup", ({key}) => 
{
    switch (key)
    {
        case 'a':
        keys.a.pressed = false;
        break;
        case 'd':
        keys.d.pressed = false;
        break;
        case ' ':
        break;
    }
})