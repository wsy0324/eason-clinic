"""
Split eason_icons_grid.jpg into 42 individual icon PNGs.

Source: 6 columns × 7 rows grid
Output: frontend/public/assets/eason_icons/icon_01.png ~ icon_42.png
"""

from PIL import Image
import os

def split_icons():
    # Paths
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    source_path = os.path.join(project_root, "assets_raw", "eason_icons_grid.jpg")
    output_dir = os.path.join(
        project_root, "frontend", "public", "assets", "eason_icons"
    )

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # Open source image
    img = Image.open(source_path)
    width, height = img.size
    print(f"Source image size: {width}x{height}")

    # 6 columns × 7 rows
    cols = 6
    rows = 7
    cell_w = width // cols
    cell_h = height // rows
    print(f"Each icon: {cell_w}x{cell_h}")

    icon_index = 1
    for row in range(rows):
        for col in range(cols):
            left = col * cell_w
            upper = row * cell_h
            right = left + cell_w
            lower = upper + cell_h

            icon = img.crop((left, upper, right, lower))
            filename = f"icon_{icon_index:02d}.png"
            filepath = os.path.join(output_dir, filename)
            icon.save(filepath, "PNG")
            print(f"Saved: {filename}")

            icon_index += 1

    print(f"\nDone! {icon_index - 1} icons saved to {output_dir}")


if __name__ == "__main__":
    split_icons()
