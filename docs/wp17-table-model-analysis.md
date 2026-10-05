# WP17 – Analyse der Tischmodelle

Messung mit Three.js `GLTFLoader` und einer Welt-Bounding-Box. Die Modelle verwenden X als Breite, Y als Höhe und Z als Tiefe. Alle drei Assets enthalten genau ein Mesh und ein Material (`Material_0`); dadurch eignen sie sich für das im Raumplaner verwendete Instancing. Die Modelle sind nicht um den Ursprung zentriert. Der Katalog gleicht den X/Z-Mittelpunkt und die minimale Y-Koordinate bei jeder Instanz aus.

| Datei | Meshes | Material | Bounding Box min | Bounding Box max | B × T × H | Dreiecke | Pivot / Orientierung |
| --- | ---: | --- | --- | --- | --- | ---: | --- |
| `dalemans-tisch-210-low.glb` | 1 | Material_0 | (0,001; -0,003; -0,855) | (1,900; 0,860; -0,007) | 1,899 × 0,848 × 0,863 m | 33.972 | Ursprung an einer äußeren Ecke; Tischplatte entlang +X, Tiefe entlang -Z, +Y oben |
| `dalemans-tisch-310-low.glb` | 1 | Material_0 | (-0,075; -0,035; -0,871) | (1,825; 0,901; 0,008) | 1,899 × 0,879 × 0,936 m | 43.900 | Ursprung nahe äußerer Ecke; Tischplatte entlang +X, Tiefe überwiegend -Z, +Y oben |
| `dalemans-tisch-trapez-low.glb` | 1 | Material_0 | (0,019; -0,046; -0,861) | (1,917; 0,895; -0,003) | 1,898 × 0,858 × 0,941 m | 33.654 | Ursprung an einer äußeren Ecke; Tischplatte entlang +X, Tiefe entlang -Z, +Y oben |

Die modellierten Maße werden als Katalog-Standardmaße verwendet (auf sinnvolle Zentimeter gerundet). Geometrie und Material werden je Modell nur einmal geladen und anschließend als `InstancedMesh` wiederverwendet. Die vorhandene WP16.4-Strategie – reduziertes GLB, gemeinsamer Loader-Cache und Instancing – bleibt damit erhalten.
