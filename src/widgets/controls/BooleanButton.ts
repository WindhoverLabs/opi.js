import { Color } from '../../Color';
import { Display } from '../../Display';
import { Font } from '../../Font';
import { HitCanvas } from '../../HitCanvas';
import { HitRegion } from '../../HitRegion';
import { Bounds } from '../../positioning';
import { BooleanProperty, ColorProperty, FontProperty, IntProperty, StringProperty } from '../../properties';
import { Widget } from '../../Widget';

const PROP_EFFECT_3D = 'effect_3d';
const PROP_FONT = 'font';
const PROP_OFF_COLOR = 'off_color';
const PROP_OFF_LABEL = 'off_label';
const PROP_ON_COLOR = 'on_color';
const PROP_ON_LABEL = 'on_label';
const PROP_PUSH_ACTION_INDEX = 'push_action_index';
const PROP_RELEASE_ACTION_INDEX = 'released_action_index'; // with 'd'
const PROP_SHOW_LED = 'show_led';
const PROP_SHOW_BOOLEAN_LABEL = 'show_boolean_label';
const PROP_SQUARE_BUTTON = 'square_button';
const PROP_TOGGLE_BUTTON = 'toggle_button';

export class BooleanButton extends Widget {

    private hovered = false;
    private enabled = false;

    private areaRegion?: HitRegion;

    constructor(display: Display) {
        super(display);

        this.properties.add(new BooleanProperty(PROP_SQUARE_BUTTON));
        this.properties.add(new BooleanProperty(PROP_SHOW_LED));
        this.properties.add(new BooleanProperty(PROP_EFFECT_3D));
        this.properties.add(new ColorProperty(PROP_ON_COLOR));
        this.properties.add(new StringProperty(PROP_ON_LABEL));
        this.properties.add(new ColorProperty(PROP_OFF_COLOR));
        this.properties.add(new StringProperty(PROP_OFF_LABEL));
        this.properties.add(new FontProperty(PROP_FONT));
        this.properties.add(new BooleanProperty(PROP_TOGGLE_BUTTON));
        this.properties.add(new IntProperty(PROP_PUSH_ACTION_INDEX));
        this.properties.add(new IntProperty(PROP_RELEASE_ACTION_INDEX));
        this.properties.add(new BooleanProperty(PROP_SHOW_BOOLEAN_LABEL));
    }

    init() {
        this.areaRegion = {
            id: `${this.wuid}-area`,
            mouseDown: () => {
                this.enabled = !this.enabled;
                if (this.enabled) {
                    this.executeAction(this.pushActionIndex);
                } else if (this.releaseActionIndex !== undefined) {
                    this.executeAction(this.releaseActionIndex);
                }
                this.requestRepaint();
            },
            mouseEnter: () => {
                this.hovered = true;
                this.requestRepaint();
            },
            mouseOut: () => {
                this.hovered = false;
                this.requestRepaint();
            },
            cursor: 'pointer'
        };
    }

    draw(ctx: CanvasRenderingContext2D, hitCanvas: HitCanvas) {
        if (this.squareButton) {
            this.drawSquare(ctx, hitCanvas);
        } else {
            this.drawEllipse(ctx, hitCanvas);
        }

        // Foreground
        if (this.width > this.height) {
            this.drawHorizontal(ctx);
        } else {
            this.drawVertical(ctx);
        }

        if (this.showBooleanLabel) {
            const label = this.enabled ? this.onLabel : this.offLabel;
            ctx.font = this.font.getFontString();
            ctx.fillStyle = this.foregroundColor.toString();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, this.x + (this.width / 2), this.y + (this.height / 2))
        }
    }

    private drawSquare(ctx: CanvasRenderingContext2D, hitCanvas: HitCanvas) {
        ctx.fillStyle = Color.DARK_GRAY.toString();
        ctx.fillRect(this.x, this.y, this.width, this.height);

        hitCanvas.beginHitRegion(this.areaRegion!);
        hitCanvas.ctx.fillRect(this.x, this.y, this.width, this.height);

        const tlColor = this.enabled ? Color.DARK_GRAY : Color.WHITE;
        const brColor = this.enabled ? Color.WHITE : Color.DARK_GRAY;
        if (this.effect3d) {
            ctx.fillStyle = tlColor.toString();
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + 2, this.y + this.height - 2);
            ctx.lineTo(this.x + 2, this.y + 2);
            ctx.lineTo(this.x + this.width - 2, this.y + 2);
            ctx.lineTo(this.x + this.width, this.y);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = brColor.toString();
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.lineTo(this.x + this.width, this.y);
            ctx.lineTo(this.x + this.width - 2, this.y + 2);
            ctx.lineTo(this.x + this.width - 2, this.y + this.height - 2);
            ctx.lineTo(this.x + 2, this.y + this.height - 2);
            ctx.closePath();
            ctx.fill();
        }

        if (this.hovered) {
            ctx.fillStyle = this.backgroundColor.mixWith(Color.WHITE, 0.5).toString();
        } else {
            ctx.fillStyle = this.backgroundColor.toString();
        }
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 2 - 2, this.height - 2 - 2);
    }

    private drawEllipse(ctx: CanvasRenderingContext2D, hitCanvas: HitCanvas) {
        if (this.effect3d) {
            const a = this.width / 2;
            const b = this.height / 2;
            const w = Math.sqrt(a * a + b * b);
            const x1 = this.x + a + (b - a - w) / 2 - 1;
            const y1 = this.y + b - (b - a + w) / 2 - 1;
            const x2 = this.x + a + (b - a + w) / 2 + 5;
            const y2 = this.y + b - (b - a - w) / 2 + 5;

            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            if (this.enabled) {
                gradient.addColorStop(0, Color.DARK_GRAY.toString());
                gradient.addColorStop(1, Color.WHITE.toString());
            } else {
                gradient.addColorStop(0, Color.WHITE.toString());
                gradient.addColorStop(1, Color.DARK_GRAY.toString());
            }
            ctx.fillStyle = gradient;
        } else if (this.enabled) {
            ctx.fillStyle = Color.WHITE.toString();
        } else {
            ctx.fillStyle = Color.DARK_GRAY.toString();
        }

        const x = this.x + (this.width / 2)
        const y = this.y + (this.height / 2)
        const rx = this.width / 2;
        const ry = this.height / 2;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
        ctx.fill();

        hitCanvas.beginHitRegion(this.areaRegion!);
        hitCanvas.ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
        hitCanvas.ctx.fill();

        if (this.hovered) {
            ctx.fillStyle = this.backgroundColor.mixWith(Color.WHITE, 0.5).toString();
        } else {
            ctx.fillStyle = this.backgroundColor.toString();
        }
        ctx.beginPath();
        ctx.ellipse(x, y, rx - 2, ry - 2, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    private drawHorizontal(ctx: CanvasRenderingContext2D) {
        if (this.showLed) {
            let diameter: number;
            if (this.squareButton) {
                diameter = Math.floor(0.3 * (this.width + this.height) / 2);
                if (diameter > Math.min(this.width, this.height)) {
                    diameter = Math.min(this.width, this.height) - 2;
                }
            } else {
                diameter = Math.floor(0.25 * (this.width + this.height) / 2);
                if (diameter > Math.min(this.width, this.height)) {
                    diameter = Math.min(this.width, this.height) - 8;
                }
            }
            const ledArea: Bounds = {
                x: Math.floor(this.x + this.width * 0.79999 - diameter / 2),
                y: Math.floor(this.y + this.height / 2 - diameter / 2),
                width: diameter,
                height: diameter
            };

            const x = ledArea.x + (ledArea.width / 2);
            const y = ledArea.y + (ledArea.height / 2);
            const rx = ledArea.width / 2;
            const ry = ledArea.height / 2;
            const ledColor = this.enabled ? this.onColor : this.offColor;
            ctx.beginPath();
            ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
            ctx.fillStyle = ledColor.toString();
            ctx.fill();

            if (this.effect3d) {
                const gradient = ctx.createLinearGradient(
                    ledArea.x, ledArea.y, ledArea.x + ledArea.width, ledArea.y + ledArea.height);
                gradient.addColorStop(0, 'white');
                gradient.addColorStop(1, ledColor.withAlpha(0).toString());
                ctx.beginPath();
                ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }
    }

    private drawVertical(ctx: CanvasRenderingContext2D) {
        if (this.showLed) {
            let diameter: number;
            if (this.squareButton) {
                diameter = Math.floor(0.3 * (this.width + this.height) / 2);
                if (diameter > Math.min(this.width, this.height)) {
                    diameter = Math.min(this.width, this.height) - 2;
                }
            } else {
                diameter = Math.floor(0.25 * (this.width + this.height) / 2);
                if (diameter > Math.min(this.width, this.height)) {
                    diameter = Math.min(this.width, this.height) - 8;
                }
            }
            const ledArea: Bounds = {
                x: Math.floor(this.x + this.width / 2 - diameter / 2),
                y: Math.floor(this.y + ((1 - 0.79999) * this.height) - diameter / 2),
                width: diameter,
                height: diameter
            };

            const ledColor = this.enabled ? this.onColor : this.offColor;
            const x = ledArea.x + (ledArea.width / 2);
            const y = ledArea.y + (ledArea.height / 2);
            const rx = ledArea.width / 2;
            const ry = ledArea.height / 2;
            ctx.beginPath();
            ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
            ctx.fillStyle = ledColor.toString();
            ctx.fill();

            if (this.effect3d) {
                const gradient = ctx.createLinearGradient(
                    ledArea.x, ledArea.y, ledArea.x + ledArea.width, ledArea.y + ledArea.height);
                gradient.addColorStop(0, Color.WHITE.toString());
                gradient.addColorStop(1, ledColor.withAlpha(0).toString());
                ctx.beginPath();
                ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }
    }

    get toggleButton(): boolean { return this.properties.getValue(PROP_TOGGLE_BUTTON); }
    get pushActionIndex(): number { return this.properties.getValue(PROP_PUSH_ACTION_INDEX); }
    get releaseActionIndex(): number { return this.properties.getValue(PROP_RELEASE_ACTION_INDEX); }
    get squareButton(): boolean { return this.properties.getValue(PROP_SQUARE_BUTTON); }
    get showLed(): boolean { return this.properties.getValue(PROP_SHOW_LED); }
    get showBooleanLabel(): boolean { return this.properties.getValue(PROP_SHOW_BOOLEAN_LABEL); }
    get effect3d(): boolean { return this.properties.getValue(PROP_EFFECT_3D); }
    get onColor(): Color { return this.properties.getValue(PROP_ON_COLOR); }
    get onLabel(): string { return this.properties.getValue(PROP_ON_LABEL); }
    get offColor(): Color { return this.properties.getValue(PROP_OFF_COLOR); }
    get offLabel(): string { return this.properties.getValue(PROP_OFF_LABEL); }
    get font(): Font { return this.properties.getValue(PROP_FONT); }
}