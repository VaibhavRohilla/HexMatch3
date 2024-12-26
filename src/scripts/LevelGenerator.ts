import { Tween, Easing } from "@tweenjs/tween.js";
import { Container, Graphics, Point } from "pixi.js";
import { config } from "./appConfig";
import { GameData, Globals, LevelVar } from "./Globals";
import { hexagons } from "./Hexagon";
import { LevelHexagons } from "./LevelPieces";
import { log } from "node:console";


export class LevelGenerator extends Container {
    private hexPieces: LevelHexagons[] = [];
    private handeMovingPieces: hexagons[] = [];
    private pickedPiece?: hexagons;
    private hexMap: Map<string, LevelHexagons> = new Map();
    hexMovingGrid: Graphics = new Graphics();
    addHexagonInterval!: NodeJS.Timeout;
    hexGridMask : Graphics = new Graphics();

    constructor() {
        super();
        this.initialize();
        this.sortDirty = true;
    }

    private initialize(): void {
        this.drawHexGrid();
        this.generateHexMap();
        this.createMovingHexagons();

        Globals.App?.app.canvas.addEventListener("mouseleave", () => {
            if (this.pickedPiece) this.checkForDropPosition();
        });

        Globals.SceneManager?.getMousePosition(this.getMousePositionCallback.bind(this));
    }

    private getMousePositionCallback({ x, y }: { x: number; y: number }): void {
        if (this.pickedPiece) {
            const position = this.toLocal({ x, y });
            this.pickedPiece.position.set(position.x, position.y);
        }
    }

    private moveCurrentHandledPiece(piece: hexagons): void {
        this.handeMovingPieces.splice(this.handeMovingPieces.indexOf(piece), 1);
        this.pickedPiece = piece;
        this.pickedPiece.mask = null;
    }

    private setDropPosition(piece: hexagons, target: LevelHexagons): void {
        target.hexagonPlaced = piece;
        piece.isHandle = true;
        this.moveHexagon(piece, target.position.x, target.position.y, 500, () => this.matchAdjacent(target));
    }

    private setRandomDropPosition(piece: hexagons): void {
        const target = this.getRandomGraphics();
        target.hexagonPlaced = piece;
        piece.isHandle = true;
        this.moveHexagon(piece, target.position.x, target.position.y, 1000, () => this.matchAdjacent(target));
    }

    private moveHexagon(piece: hexagons, x: number, y: number, duration: number, onComplete?: () => void): void {
        new Tween(piece, Globals.SceneManager?.tweenGroup)
            .to({ x, y }, duration)
            .easing( Easing.Exponential.Out,)
            .onComplete(() => onComplete?.())
            .start();
    }

    private createMovingHexagons(): void {
        this.hexMovingGrid = this.createRoundedRect();
        this.hexGridMask = this.createRoundedRect();
        this.addChild(this.hexMovingGrid,  this.hexGridMask);

      
        this.createHexagon(this.hexMovingGrid.position.x - LevelVar.HEX_RADIUS * 1 * LevelVar.hexGap, this.hexMovingGrid.position.y + this.hexMovingGrid.height / 2);
        
      

      
    }

    private createRoundedRect(): Graphics {
        const graphics = new Graphics();
        graphics.roundRect(0, 0, config.logicalWidth * 0.9, 100, 45);
        graphics.position.set(-config.logicalWidth / 2, 800);
        graphics.fill(LevelVar.FILL_COLOR);
        return graphics;
    }

   

    private createHexagon(x: number, y: number): void {
        const hex = new hexagons(0, 0, LevelVar.HEX_RADIUS, this.moveCurrentHandledPiece.bind(this), this.checkForDropPosition.bind(this));
        hex.position.set(x, y);
        // hex.mask =  this.hexGridMask;
        this.handeMovingPieces.push(hex);
        this.addChild(hex);
        setTimeout(() => {
            const lastHex = this.handeMovingPieces[this.handeMovingPieces.length - 1].position;
            this.createHexagon(lastHex.x - LevelVar.HEX_RADIUS * LevelVar.hexGap, this.hexMovingGrid.position.y + this.hexMovingGrid.height / 2);
        },LevelVar.hexSpawnTime);
    }

    private drawHexGrid(): void {
        const hexPositions = this.getHexGridPositions(LevelVar.HEX_ROWS, LevelVar.HEX_RADIUS, LevelVar.HEX_SPACING);

        hexPositions.forEach(({ x, y, q, r }, index) => {
            const hex = new LevelHexagons({ x, y }, index, q, r);
            this.hexPieces.push(hex);
            this.addChild(hex);
        });

        this.position.set(550, 950);
    }

    private generateHexMap(): void {
        this.hexPieces.forEach(hex => {
            const key = `${hex.q},${hex.r}`;
            this.hexMap.set(key, hex);
        });
    }

    private getHexAt(q: number, r: number): LevelHexagons | undefined {
        return this.hexMap.get(`${q},${r}`);
    }

    private checkForDropPosition(): void {
        if (!this.pickedPiece) return;
        const foundPiece = this.pickedPiece;
        this.pickedPiece = undefined;

        let targetHex: LevelHexagons | undefined;

        this.hexPieces.forEach(hex => {
            const distance = this.calculateDistance(hex.position, foundPiece.position);
            if (distance < LevelVar.HEX_RADIUS && !hex.hexagonPlaced) {
                targetHex = hex;
            }
        });

        if (targetHex) {
            this.setDropPosition(foundPiece, targetHex);
        } else {
            this.setRandomDropPosition(foundPiece);
        }
    }

    private calculateDistance(pos1: Point, pos2: Point): number {
        return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
    }

    private getHexGridPositions(rows: number, hexRadius: number, spacing: number): { x: number; y: number; q: number; r: number }[] {
        const positions: { x: number; y: number; q: number; r: number }[] = [];
        const hexHeight = Math.sqrt(1.2) * hexRadius;
        const rowSpacing = spacing + hexHeight;
        const colSpacing = spacing + hexRadius;

        for (let q = -rows; q <= rows; q++) {
            for (let r = -rows; r <= rows; r++) {
                const s = -q - r;
                if (Math.abs(s) <= rows) {
                    const x = q * colSpacing;
                    const y = r * rowSpacing + (q * rowSpacing) / 2;
                    positions.push({ x, y, q, r });
                }
            }
        }
        return positions;
    }

    private getRandomGraphics(): LevelHexagons {
        const availableHexes = this.hexPieces.filter(hex => !hex.hexagonPlaced);
        if (availableHexes.length === 0) {
            Globals.emitter?.Call("gameOver");
            alert("Game Over");
        }
        return availableHexes[Math.floor(Math.random() * availableHexes.length)];
    }

    private matchAdjacent(hex: LevelHexagons): void {
        // Find all connected hexagons with the same color
        const matches = this.findConnectedHexagons(hex);
        
        // Check if there are more than 2 matches
        if (matches.length > 2) {
            matches.forEach(match => {
                const hexagon = match.hexagonPlaced;
                if (hexagon) {
                    // Destroy the hexagon and remove it from the grid
                    hexagon.destroyHexagon(() => this.removeChild(hexagon));
                    match.hexagonPlaced = undefined;
                }
            });
        }
    }
    
    private findConnectedHexagons(hex: LevelHexagons, visited: Set<LevelHexagons> = new Set()): LevelHexagons[] {
        const matches: LevelHexagons[] = [];
        const stack: LevelHexagons[] = [hex];
    
        while (stack.length > 0) {
            const current = stack.pop();
            if (!current || visited.has(current)) continue;
    
            // Mark current hex as visited
            visited.add(current);
            matches.push(current);
    
            // Find all adjacent hexagons with the same color and add them to the stack
            const neighbors = this.getAdjacentHexagonsByColor(current);
            stack.push(...neighbors.filter(neighbor => !visited.has(neighbor)));
        }
    
        return matches;
    }
    
    private getAdjacentHexagonsByColor(hex: LevelHexagons): LevelHexagons[] {
        const neighbors: LevelHexagons[] = [];
        const directions = [
            { q: 0, r: -1 }, // Top
            { q: 1, r: -1 }, // Top-right
            { q: 1, r: 0 },  // Bottom-right
            { q: 0, r: 1 },  // Bottom
            { q: -1, r: 1 }, // Bottom-left (adjusted)
            { q: -1, r: 0 }, // Top-left
        ];
    
        const colorId = hex.hexagonPlaced?.colorId;
        if (colorId === undefined) return neighbors;
    
        directions.forEach(({ q, r }) => {
            const neighbor = this.getHexAt(hex.q + q, hex.r + r);
            if (neighbor?.hexagonPlaced?.colorId === colorId) {
                neighbors.push(neighbor);
            }
        });
    
        return neighbors;
    }
    
    

    update(dt: number): void {
        this.handeMovingPieces.forEach(piece => {
            piece.position.x += dt * GameData.CurrentSpeed;
            if (piece.position.x >= this.hexMovingGrid.width / 2 - LevelVar.HEX_RADIUS * 1.9) {
                piece.mask = null;
                this.setRandomDropPosition(piece);
                this.handeMovingPieces.splice(this.handeMovingPieces.indexOf(piece), 1);
            }
        });
    }
    expandHexGrid(): void {
        // Increment the number of rows and regenerate grid positions
        // Get new grid positions
        const newHexPositions = this.getHexGridPositions(LevelVar.HEX_ROWS, LevelVar.HEX_RADIUS, LevelVar.HEX_SPACING);
    
        // Add new hexagons to the grid
        newHexPositions.forEach(({ x, y, q, r }) => {
            const key = `${q},${r}`;
            if (!this.hexMap.has(key)) {
                // Add new hexagon only if it doesn't already exist
                const hex = new LevelHexagons({ x, y }, this.hexPieces.length, q, r);
                this.hexPieces.push(hex);
                this.hexMap.set(key, hex);
                this.addChild(hex);
            }
        });
    }
    
    
}


