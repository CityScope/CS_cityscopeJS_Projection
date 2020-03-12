# Projection Mapping Tool for MIT CityScope

![alt text](/prjmap.gif "demo")

This tool allows projection mapping [keystone] of media files. The tool will load, display and save the last position of the mapped object between browser sessions.

## Usage

-   Drag common media files (jpeg, png, gif, mp4, etc..)
-   use `left/right` arrow keys to change images
-   click `f` to go full screen and hide UI
-   click `ctrl-d` to clear browser cache and reset projection mapping

### Projection mapping

-   press `Shift+z` to Toggle [on/off] edit mode and reposition and keystone the divs

#### When in `Edit` Mode

-   click or drag select and move quads/corner points
-   `SHIFT + drag` move selected quad/corner point with 10x precision
-   `ALT + drag` rotate and scale selected quad
-   `SHIFT + ALT + drag` rotate and scale selected quad with 10x precision.
-   Arrow keys move selected quad/corner point
-   `SHIFT + Arrow keys` move selected quad/corner point by 10 pixels
-   `ALT + Arrow keys` rotate and scale selected quad
-   `s` Solo or unsolo the selected quad (hides all others). This helps to adjust quads when corner points are very close together.
-   `c` Toggle mouse cursor crosshairs
-   `b` Toggle display bounds/metrics
-   `r` Rotate selected layer 90 degrees clockwise
-   `h` Flip selected layer horizontally
-   `v` Flip selected layer vertically

Maintained by [Ariel Noyman](http://arielnoyman.com)

(Uses the wonderful MapTasticJS lib)[https://github.com/glowbox/maptasticjs]
