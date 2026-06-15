"""
Remove white/near-white background from eason_wordmark.webp,
output as transparent PNG for use on dark stage background.
"""

from PIL import Image
import os

def remove_white_background():
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    source_path = os.path.join(project_root, "assets_raw", "eason_wordmark.webp")
    output_path = os.path.join(
        project_root, "frontend", "public", "assets", "eason_wordmark_transparent.png"
    )

    img = Image.open(source_path)
    print(f"Source: {img.size} {img.mode}")

    # Convert to RGBA
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    pixels = img.load()
    width, height = img.size

    # Process each pixel: make white/near-white pixels transparent
    # Threshold: R>230, G>230, B>230 → transparent
    # Also do a second pass to semi-transparent near-edge pixels for smooth edges
    threshold = 230
    feather = 25  # pixels near threshold get partial transparency

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            brightness = max(r, g, b)
            if brightness >= threshold:
                # Fully white area → fully transparent
                pixels[x, y] = (r, g, b, 0)
            elif brightness >= threshold - feather:
                # Transition zone → semi-transparent (feathered edge)
                factor = (threshold - brightness) / feather
                new_alpha = int(a * factor)
                pixels[x, y] = (r, g, b, new_alpha)

    # Save as PNG (supports transparency)
    img.save(output_path, "PNG")
    print(f"Saved transparent version to: {output_path}")

    # Verify
    result = Image.open(output_path)
    print(f"Output: {result.size} {result.mode}")


if __name__ == "__main__":
    remove_white_background()
