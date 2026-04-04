"""
Render cinematic hourglass video — 10s loop, 1080x1920, dark bg
Run: /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/render_hourglass.py
"""
import bpy, math, os

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# Render settings
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 720
scene.render.resolution_y = 1280
scene.render.resolution_percentage = 100
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 240  # 10 seconds

scene.eevee.taa_render_samples = 32
try:
    scene.eevee.use_bloom = True
    scene.eevee.bloom_threshold = 0.5
    scene.eevee.bloom_intensity = 0.5
except AttributeError:
    pass  # Bloom API changed in Blender 4.x

# Black background
scene.render.film_transparent = False
scene.world = bpy.data.worlds.new("W")
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0,0,0,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0

# Output
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.constant_rate_factor = 'HIGH'
scene.render.ffmpeg.audio_codec = 'NONE'
scene.render.filepath = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "img", "hourglass-hero.mp4")

# --- MATERIALS ---
def make_mat(name, color, metallic=0, roughness=0.5, emission=0, alpha=1.0, is_glass=False):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n = m.node_tree.nodes; l = m.node_tree.links; n.clear()
    if is_glass:
        b = n.new('ShaderNodeBsdfGlass')
        b.inputs['Color'].default_value = color
        b.inputs['Roughness'].default_value = roughness
        b.inputs['IOR'].default_value = 1.45
    else:
        b = n.new('ShaderNodeBsdfPrincipled')
        b.inputs['Base Color'].default_value = color
        b.inputs['Metallic'].default_value = metallic
        b.inputs['Roughness'].default_value = roughness
        if emission > 0:
            b.inputs['Emission Color'].default_value = color
            b.inputs['Emission Strength'].default_value = emission
    o = n.new('ShaderNodeOutputMaterial')
    l.new(b.outputs[0], o.inputs['Surface'])
    if is_glass:
        try:
            m.blend_method = 'BLEND'
            m.use_screen_refraction = True
        except AttributeError:
            pass  # API changed in Blender 4.x
    return m

glass = make_mat("Glass", (0.92, 0.95, 1.0, 1), roughness=0.01, is_glass=True)
metal = make_mat("Metal", (0.04, 0.04, 0.05, 1), metallic=0.95, roughness=0.2)
sand = make_mat("Sand", (0.9, 0.7, 0.3, 1), roughness=0.85, emission=0.3)
wood = make_mat("Wood", (0.15, 0.08, 0.03, 1), roughness=0.55)

# --- GEOMETRY ---
def add(op, mat, name, **kw):
    op(**kw)
    o = bpy.context.active_object
    o.name = name
    bpy.ops.object.shade_smooth()
    o.data.materials.append(mat)
    return o

# Glass bulbs
add(bpy.ops.mesh.primitive_uv_sphere_add, glass, "UpperBulb", segments=48, ring_count=32, radius=0.75, location=(0,0,1.3))
bpy.context.active_object.scale=(1,1,0.8); bpy.ops.object.transform_apply(scale=True)
add(bpy.ops.mesh.primitive_uv_sphere_add, glass, "LowerBulb", segments=48, ring_count=32, radius=0.75, location=(0,0,-1.3))
bpy.context.active_object.scale=(1,1,0.8); bpy.ops.object.transform_apply(scale=True)

# Neck
add(bpy.ops.mesh.primitive_cylinder_add, glass, "Neck", radius=0.1, depth=1.4, vertices=32, location=(0,0,0))

# Metal caps
add(bpy.ops.mesh.primitive_cylinder_add, metal, "TopCap", radius=0.85, depth=0.12, vertices=48, location=(0,0,2.15))
add(bpy.ops.mesh.primitive_cylinder_add, metal, "BotCap", radius=0.85, depth=0.12, vertices=48, location=(0,0,-2.15))

# Pillars
for a in [45,135,225,315]:
    r = math.radians(a)
    add(bpy.ops.mesh.primitive_cylinder_add, metal, f"P{a}", radius=0.035, depth=4.1, vertices=12, location=(0.7*math.cos(r), 0.7*math.sin(r), 0))

# Wood base
add(bpy.ops.mesh.primitive_cylinder_add, wood, "Base", radius=0.95, depth=0.22, vertices=48, location=(0,0,-2.35))

# Sand
s1 = add(bpy.ops.mesh.primitive_cone_add, sand, "SandTop", radius1=0.5, radius2=0, depth=0.5, vertices=32, location=(0,0,1.5))
s1.rotation_euler=(math.pi,0,0); bpy.ops.object.transform_apply(rotation=True)
s2 = add(bpy.ops.mesh.primitive_cone_add, sand, "SandBot", radius1=0.55, radius2=0, depth=0.45, vertices=32, location=(0,0,-1.45))
add(bpy.ops.mesh.primitive_cylinder_add, sand, "Stream", radius=0.02, depth=1.2, vertices=8, location=(0,0,0))

# --- PARENT + ANIMATE ---
bpy.ops.object.empty_add(location=(0,0,0))
parent = bpy.context.active_object
parent.name = "Root"
for o in bpy.data.objects:
    if o != parent and o.type == 'MESH':
        o.parent = parent

# Slow rotation
parent.rotation_euler = (0, 0, 0)
parent.keyframe_insert('rotation_euler', frame=1)
parent.rotation_euler = (0, 0, math.radians(360))
parent.keyframe_insert('rotation_euler', frame=240)
for fc in parent.animation_data.action.fcurves:
    for kf in fc.keyframe_points:
        kf.interpolation = 'LINEAR'

# Sand animation
s1.scale = (1,1,1); s1.keyframe_insert('scale', frame=1)
s1.scale = (0.2,0.2,0.2); s1.keyframe_insert('scale', frame=240)
s2.scale = (0.2,0.2,0.2); s2.keyframe_insert('scale', frame=1)
s2.scale = (1,1,1); s2.keyframe_insert('scale', frame=240)

# --- CAMERA ---
bpy.ops.object.camera_add(location=(0, -5, 0.3))
cam = bpy.context.active_object
cam.rotation_euler = (math.radians(87), 0, 0)
cam.data.lens = 85
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = 5
cam.data.dof.aperture_fstop = 2.8
scene.camera = cam

# --- LIGHTING ---
bpy.ops.object.light_add(type='AREA', location=(3, -2, 3.5))
k = bpy.context.active_object; k.data.energy = 200; k.data.size = 2.5
k.data.color = (1, 0.93, 0.82); k.rotation_euler = (math.radians(50), 0, math.radians(25))

bpy.ops.object.light_add(type='AREA', location=(-2.5, 2.5, -1))
r = bpy.context.active_object; r.data.energy = 80; r.data.size = 3
r.data.color = (0.65, 0.75, 1.0)

bpy.ops.object.light_add(type='SPOT', location=(0.5, -1.5, 0))
a = bpy.context.active_object; a.data.energy = 60; a.data.color = (1, 0.82, 0.45)
a.data.spot_size = math.radians(35); a.rotation_euler = (math.radians(90), 0, 0)

# --- RENDER ---
print(f"\n🎬 Rendering {scene.frame_end} frames...")
bpy.ops.render.render(animation=True)
sz = os.path.getsize(scene.render.filepath)
print(f"\n✅ Done! {sz/1024:.0f}KB → {scene.render.filepath}")
