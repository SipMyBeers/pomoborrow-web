"""
Create a premium hourglass 3D model for pomoborrow.com
Run with: blender --background --python create_hourglass.py
Exports: ../models/hourglass.glb
"""

import bpy
import math
import os

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene

# ============================================
# MATERIALS
# ============================================

# Glass material — transparent, slightly blue tinted
glass_mat = bpy.data.materials.new(name="Glass")
glass_mat.use_nodes = True
nodes = glass_mat.node_tree.nodes
links = glass_mat.node_tree.links
nodes.clear()

# Principled BSDF for glass
bsdf = nodes.new('ShaderNodeBsdfPrincipled')
bsdf.inputs['Base Color'].default_value = (0.85, 0.9, 0.95, 1.0)
bsdf.inputs['Metallic'].default_value = 0.0
bsdf.inputs['Roughness'].default_value = 0.05
bsdf.inputs['IOR'].default_value = 1.45
bsdf.inputs['Alpha'].default_value = 0.3
bsdf.inputs['Specular IOR Level'].default_value = 0.5

output = nodes.new('ShaderNodeOutputMaterial')
links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
glass_mat.blend_method = 'BLEND' if hasattr(glass_mat, 'blend_method') else None

# Dark metal frame material
frame_mat = bpy.data.materials.new(name="Frame")
frame_mat.use_nodes = True
nodes = frame_mat.node_tree.nodes
links = frame_mat.node_tree.links
nodes.clear()

bsdf = nodes.new('ShaderNodeBsdfPrincipled')
bsdf.inputs['Base Color'].default_value = (0.08, 0.08, 0.08, 1.0)
bsdf.inputs['Metallic'].default_value = 0.9
bsdf.inputs['Roughness'].default_value = 0.3

output = nodes.new('ShaderNodeOutputMaterial')
links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

# Wood base material
wood_mat = bpy.data.materials.new(name="Wood")
wood_mat.use_nodes = True
nodes = wood_mat.node_tree.nodes
links = wood_mat.node_tree.links
nodes.clear()

bsdf = nodes.new('ShaderNodeBsdfPrincipled')
bsdf.inputs['Base Color'].default_value = (0.25, 0.15, 0.08, 1.0)
bsdf.inputs['Metallic'].default_value = 0.0
bsdf.inputs['Roughness'].default_value = 0.6

output = nodes.new('ShaderNodeOutputMaterial')
links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

# Sand material — warm gold
sand_mat = bpy.data.materials.new(name="Sand")
sand_mat.use_nodes = True
nodes = sand_mat.node_tree.nodes
links = sand_mat.node_tree.links
nodes.clear()

bsdf = nodes.new('ShaderNodeBsdfPrincipled')
bsdf.inputs['Base Color'].default_value = (0.85, 0.7, 0.35, 1.0)
bsdf.inputs['Metallic'].default_value = 0.1
bsdf.inputs['Roughness'].default_value = 0.8

output = nodes.new('ShaderNodeOutputMaterial')
links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

# Red crack glow material
crack_mat = bpy.data.materials.new(name="CrackGlow")
crack_mat.use_nodes = True
nodes = crack_mat.node_tree.nodes
links = crack_mat.node_tree.links
nodes.clear()

emission = nodes.new('ShaderNodeEmission')
emission.inputs['Color'].default_value = (1.0, 0.2, 0.1, 1.0)
emission.inputs['Strength'].default_value = 5.0

output = nodes.new('ShaderNodeOutputMaterial')
links.new(emission.outputs['Emission'], output.inputs['Surface'])


# ============================================
# HOURGLASS GEOMETRY
# ============================================

def create_glass_bulb(name, z_offset, flip=False):
    """Create one half of the hourglass glass using a lathe profile."""
    # Profile curve for the glass bulb (revolution surface)
    verts = []
    num_points = 32

    for i in range(num_points + 1):
        t = i / num_points  # 0 to 1

        if flip:
            t = 1.0 - t

        # Hourglass profile: wide at top/bottom, narrow at middle
        # Using a smooth curve
        y = t * 2.0 - 1.0  # -1 to 1

        # Radius function — wide at extremes, narrow at center
        if abs(y) < 0.15:
            # Neck — very narrow
            r = 0.08 + (abs(y) / 0.15) * 0.02
        else:
            # Bulb — smooth expansion
            norm_y = (abs(y) - 0.15) / 0.85
            r = 0.10 + norm_y * norm_y * 0.55

        actual_z = z_offset + t * 2.0
        verts.append((r, actual_z))

    return verts

# Create the glass body as a surface of revolution
bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=32, radius=0.65, location=(0, 0, 1.0))
glass_upper = bpy.context.active_object
glass_upper.name = "GlassUpper"

# Scale to hourglass shape — edit mode vertex manipulation
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.object.mode_set(mode='OBJECT')

# Apply hourglass deformation via shape keys / lattice
# Simpler approach: use two scaled spheres connected by a cylinder

# Actually, let's use a cleaner approach with curves
bpy.ops.object.delete()

# Upper bulb — sphere squished
bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=0.5, location=(0, 0, 1.2))
upper_bulb = bpy.context.active_object
upper_bulb.name = "UpperBulb"
upper_bulb.scale = (1.0, 1.0, 0.75)
bpy.ops.object.transform_apply(scale=True)
upper_bulb.data.materials.append(glass_mat)

# Lower bulb
bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=0.5, location=(0, 0, -1.2))
lower_bulb = bpy.context.active_object
lower_bulb.name = "LowerBulb"
lower_bulb.scale = (1.0, 1.0, 0.75)
bpy.ops.object.transform_apply(scale=True)
lower_bulb.data.materials.append(glass_mat)

# Neck — connecting cylinder, narrow
bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=1.2, vertices=24, location=(0, 0, 0))
neck = bpy.context.active_object
neck.name = "Neck"
neck.data.materials.append(glass_mat)

# ============================================
# FRAME
# ============================================

# Top cap
bpy.ops.mesh.primitive_cylinder_add(radius=0.6, depth=0.12, vertices=32, location=(0, 0, 2.0))
top_cap = bpy.context.active_object
top_cap.name = "TopCap"
top_cap.data.materials.append(frame_mat)

# Bottom cap
bpy.ops.mesh.primitive_cylinder_add(radius=0.6, depth=0.12, vertices=32, location=(0, 0, -2.0))
bottom_cap = bpy.context.active_object
bottom_cap.name = "BottomCap"
bottom_cap.data.materials.append(frame_mat)

# Four vertical posts
for angle in [0, 90, 180, 270]:
    rad = math.radians(angle)
    x = 0.52 * math.cos(rad)
    y = 0.52 * math.sin(rad)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=3.9, vertices=12, location=(x, y, 0))
    post = bpy.context.active_object
    post.name = f"Post_{angle}"
    post.data.materials.append(frame_mat)

# ============================================
# WOOD BASE
# ============================================

bpy.ops.mesh.primitive_cylinder_add(radius=0.7, depth=0.2, vertices=32, location=(0, 0, -2.2))
base = bpy.context.active_object
base.name = "WoodBase"
base.data.materials.append(wood_mat)

# ============================================
# SAND (upper chamber — pile)
# ============================================

# Sand in upper chamber — cone shape (sand that hasn't fallen yet)
bpy.ops.mesh.primitive_cone_add(radius1=0.35, radius2=0.0, depth=0.5, vertices=24, location=(0, 0, 1.4))
sand_upper = bpy.context.active_object
sand_upper.name = "SandUpper"
sand_upper.rotation_euler = (math.pi, 0, 0)  # Flip upside down (pile going down)
sand_upper.data.materials.append(sand_mat)

# Sand in lower chamber — cone pile
bpy.ops.mesh.primitive_cone_add(radius1=0.38, radius2=0.0, depth=0.45, vertices=24, location=(0, 0, -1.3))
sand_lower = bpy.context.active_object
sand_lower.name = "SandLower"
sand_lower.data.materials.append(sand_mat)

# Sand stream through neck — thin cylinder
bpy.ops.mesh.primitive_cylinder_add(radius=0.02, depth=1.0, vertices=8, location=(0, 0, 0))
sand_stream = bpy.context.active_object
sand_stream.name = "SandStream"
sand_stream.data.materials.append(sand_mat)

# ============================================
# CRACK LINES (on lower bulb)
# ============================================

# Create crack lines as thin emissive strips
for i, angle in enumerate([30, 150, 250]):
    rad = math.radians(angle)
    x = 0.48 * math.cos(rad)
    y = 0.48 * math.sin(rad)

    bpy.ops.mesh.primitive_plane_add(size=0.02, location=(x, y, -1.5))
    crack = bpy.context.active_object
    crack.name = f"Crack_{i}"
    crack.scale = (0.5, 8.0, 1.0)
    crack.rotation_euler = (0, 0, rad + math.pi/4)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    crack.data.materials.append(crack_mat)

# ============================================
# LIGHTING
# ============================================

# Key light
bpy.ops.object.light_add(type='AREA', location=(3, -2, 4))
key_light = bpy.context.active_object
key_light.name = "KeyLight"
key_light.data.energy = 200
key_light.data.size = 3

# Fill light
bpy.ops.object.light_add(type='AREA', location=(-3, 2, 2))
fill_light = bpy.context.active_object
fill_light.name = "FillLight"
fill_light.data.energy = 80
fill_light.data.size = 2

# Rim light
bpy.ops.object.light_add(type='AREA', location=(0, 3, 1))
rim_light = bpy.context.active_object
rim_light.name = "RimLight"
rim_light.data.energy = 120
rim_light.data.size = 2

# ============================================
# CAMERA (optional, for previewing)
# ============================================

bpy.ops.object.camera_add(location=(4, -4, 2))
camera = bpy.context.active_object
camera.name = "Camera"
camera.rotation_euler = (math.radians(70), 0, math.radians(45))
scene.camera = camera

# ============================================
# EXPORT
# ============================================

output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "hourglass.glb")

# Select all mesh objects for export
bpy.ops.object.select_all(action='SELECT')

bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    use_selection=False,
    export_lights=False,  # Three.js will handle lighting
    export_cameras=False,
    export_apply=True,
    export_materials='EXPORT',
)

print(f"\n✅ Hourglass model exported to: {output_path}")
print(f"   File size: {os.path.getsize(output_path) / 1024:.1f} KB")
