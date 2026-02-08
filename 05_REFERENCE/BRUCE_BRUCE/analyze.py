import laspy
import os

laz_file = 'USGS_LPC_MS_Natchez_Trace_LiDAR_2016_B16_15RXQ570410.laz'

las = laspy.read(laz_file)
h = las.header

print('FILE SIZE:', os.path.getsize(laz_file) / (1024**2), 'MB')
print('TOTAL POINTS:', f'{h.point_count:,}')
print('X:', f'{h.x_min:,.0f} to {h.x_max:,.0f}')
print('Y:', f'{h.y_min:,.0f} to {h.y_max:,.0f}')
print('Z:', f'{h.z_min:,.0f} to {h.z_max:,.0f}')

w = h.x_max - h.x_min
l = h.y_max - h.y_min
a = (w * l) / 4046.86

print('WIDTH (meters):', f'{w:,.0f}')
print('LENGTH (meters):', f'{l:,.0f}')
print('ACRES:', f'{a:,.0f}')
print('POINTS PER SQ-M:', f'{h.point_count/(w*l):.2f}')

if 'classification' in las.point_format.standard_names:
    from collections import Counter
    c = Counter(las.classification)
    names = {2:'Ground', 3:'LowVeg', 4:'MedVeg', 5:'HighVeg', 6:'Buildings', 7:'Noise'}
    print('CLASSIFICATION:')
    for k in sorted(c.keys()):
        pct = 100*c[k]/h.point_count
        print(f"  {names.get(k, f'Class{k}')}: {c[k]:,} ({pct:.1f}%)")