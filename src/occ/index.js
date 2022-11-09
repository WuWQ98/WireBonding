import * as THREE from "three";

const visualize = (openCascade, shape) => {
  let geometries = [];
  const ExpFace = new openCascade.TopExp_Explorer_1();
  for (
    ExpFace.Init(
      shape,
      openCascade.TopAbs_ShapeEnum.TopAbs_FACE,
      openCascade.TopAbs_ShapeEnum.TopAbs_SHAPE
    );
    ExpFace.More();
    ExpFace.Next()
  ) {
    const myShape = ExpFace.Current();
    const myFace = openCascade.TopoDS.Face_1(myShape);
    let inc;
    try {
      //in case some of the faces can not been visualized
      inc = new openCascade.BRepMesh_IncrementalMesh_2(
        myFace,
        0.1,
        false,
        0.5,
        false
      );
    } catch (e) {
      console.error("face visualizing failed");
      continue;
    }

    const aLocation = new openCascade.TopLoc_Location_1();
    const myT = openCascade.BRep_Tool.Triangulation(
      myFace,
      aLocation,
      0 /* == Poly_MeshPurpose_NONE */
    );
    if (myT.IsNull()) {
      continue;
    }

    const pc = new openCascade.Poly_Connect_2(myT);
    const triangulation = myT.get();

    let vertices = new Float32Array(triangulation.NbNodes() * 3);

    // write vertex buffer
    for (let i = 1; i <= triangulation.NbNodes(); i++) {
      const t1 = aLocation.Transformation();
      const p = triangulation.Node(i);
      const p1 = p.Transformed(t1);
      vertices[3 * (i - 1)] = p1.X();
      vertices[3 * (i - 1) + 1] = p1.Y();
      vertices[3 * (i - 1) + 2] = p1.Z();
      p.delete();
      t1.delete();
      p1.delete();
    }

    // write normal buffer
    const myNormal = new openCascade.TColgp_Array1OfDir_2(
      1,
      triangulation.NbNodes()
    );
    openCascade.StdPrs_ToolTriangulatedShape.Normal(myFace, pc, myNormal);

    let normals = new Float32Array(myNormal.Length() * 3);
    for (let i = myNormal.Lower(); i <= myNormal.Upper(); i++) {
      const t1 = aLocation.Transformation();
      const d1 = myNormal.Value(i);
      const d = d1.Transformed(t1);

      normals[3 * (i - 1)] = d.X();
      normals[3 * (i - 1) + 1] = d.Y();
      normals[3 * (i - 1) + 2] = d.Z();

      t1.delete();
      d1.delete();
      d.delete();
    }

    myNormal.delete();

    // write triangle buffer
    const orient = myFace.Orientation_1();
    const triangles = myT.get().Triangles();
    let indices;
    let triLength = triangles.Length() * 3;
    if (triLength > 65535) indices = new Uint32Array(triLength);
    else indices = new Uint16Array(triLength);

    for (let nt = 1; nt <= myT.get().NbTriangles(); nt++) {
      const t = triangles.Value(nt);
      let n1 = t.Value(1);
      let n2 = t.Value(2);
      let n3 = t.Value(3);
      if (orient !== openCascade.TopAbs_Orientation.TopAbs_FORWARD) {
        let tmp = n1;
        n1 = n2;
        n2 = tmp;
      }

      indices[3 * (nt - 1)] = n1 - 1;
      indices[3 * (nt - 1) + 1] = n2 - 1;
      indices[3 * (nt - 1) + 2] = n3 - 1;
      t.delete();
    }
    triangles.delete();

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));

    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometries.push(geometry);

    pc.delete();
    aLocation.delete();
    myT.delete();
    inc.delete();
    myFace.delete();
    myShape.delete();
  }
  ExpFace.delete();
  return geometries;
};

const addShapeToScene = async (openCascade, shape, scene) => {
  const objectMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.9, 0.9, 0.9),
  });
  let geometries = visualize(openCascade, shape);
  let group = new THREE.Group();
  geometries.forEach((geometry) => {
    group.add(new THREE.Mesh(geometry, objectMat));
  });

  group.name = "shape";
  group.rotation.x = -Math.PI / 2;
  scene.add(group);
};

const makeBottle = (openCascade, myWidth, myHeight, myThickness) => {
  // Profile : Define Support Points
  const aPnt1 = new openCascade.gp_Pnt_3(-myWidth / 2, 0, 0);
  const aPnt2 = new openCascade.gp_Pnt_3(-myWidth / 2, -myThickness / 4, 0);
  const aPnt3 = new openCascade.gp_Pnt_3(0, -myThickness / 2, 0);
  const aPnt4 = new openCascade.gp_Pnt_3(myWidth / 2, -myThickness / 4, 0);
  const aPnt5 = new openCascade.gp_Pnt_3(myWidth / 2, 0, 0);

  // Profile : Define the Geometry
  const anArcOfCircle = new openCascade.GC_MakeArcOfCircle_4(
    aPnt2,
    aPnt3,
    aPnt4
  );
  const aSegment1 = new openCascade.GC_MakeSegment_1(aPnt1, aPnt2);
  const aSegment2 = new openCascade.GC_MakeSegment_1(aPnt4, aPnt5);

  // Profile : Define the Topology
  const anEdge1 = new openCascade.BRepBuilderAPI_MakeEdge_24(
    new openCascade.Handle_Geom_Curve_2(aSegment1.Value().get())
  );
  const anEdge2 = new openCascade.BRepBuilderAPI_MakeEdge_24(
    new openCascade.Handle_Geom_Curve_2(anArcOfCircle.Value().get())
  );
  const anEdge3 = new openCascade.BRepBuilderAPI_MakeEdge_24(
    new openCascade.Handle_Geom_Curve_2(aSegment2.Value().get())
  );
  const aWire = new openCascade.BRepBuilderAPI_MakeWire_4(
    anEdge1.Edge(),
    anEdge2.Edge(),
    anEdge3.Edge()
  );

  // Complete Profile
  const xAxis = openCascade.gp.OX();
  const aTrsf = new openCascade.gp_Trsf_1();

  aTrsf.SetMirror_2(xAxis);
  const aBRepTrsf = new openCascade.BRepBuilderAPI_Transform_2(
    aWire.Wire(),
    aTrsf,
    false
  );
  const aMirroredShape = aBRepTrsf.Shape();

  const mkWire = new openCascade.BRepBuilderAPI_MakeWire_1();
  mkWire.Add_2(aWire.Wire());
  mkWire.Add_2(openCascade.TopoDS.Wire_1(aMirroredShape));
  const myWireProfile = mkWire.Wire();

  // Body : Prism the Profile
  const myFaceProfile = new openCascade.BRepBuilderAPI_MakeFace_15(
    myWireProfile,
    false
  );
  const aPrismVec = new openCascade.gp_Vec_4(0, 0, myHeight);
  let myBody = new openCascade.BRepPrimAPI_MakePrism_1(
    myFaceProfile.Face(),
    aPrismVec,
    false,
    true
  );

  // Body : Apply Fillets
  const mkFillet = new openCascade.BRepFilletAPI_MakeFillet(
    myBody.Shape(),
    openCascade.ChFi3d_FilletShape.ChFi3d_Rational
  );
  const anEdgeExplorer = new openCascade.TopExp_Explorer_2(
    myBody.Shape(),
    openCascade.TopAbs_ShapeEnum.TopAbs_EDGE,
    openCascade.TopAbs_ShapeEnum.TopAbs_SHAPE
  );
  while (anEdgeExplorer.More()) {
    const anEdge = openCascade.TopoDS.Edge_1(anEdgeExplorer.Current());
    // Add edge to fillet algorithm
    mkFillet.Add_2(myThickness / 12, anEdge);
    anEdgeExplorer.Next();
  }
  myBody = mkFillet.Shape();

  // Body : Add the Neck
  const neckLocation = new openCascade.gp_Pnt_3(0, 0, myHeight);
  const neckAxis = openCascade.gp.DZ();
  const neckAx2 = new openCascade.gp_Ax2_3(neckLocation, neckAxis);

  const myNeckRadius = myThickness / 4;
  const myNeckHeight = myHeight / 10;

  const MKCylinder = new openCascade.BRepPrimAPI_MakeCylinder_3(
    neckAx2,
    myNeckRadius,
    myNeckHeight
  );
  const myNeck = MKCylinder.Shape();

  myBody = new openCascade.BRepAlgoAPI_Fuse_3(
    myBody,
    myNeck,
    new openCascade.Message_ProgressRange_1()
  );

  // Body : Create a Hollowed Solid
  let faceToRemove;
  let zMax = -1;
  const aFaceExplorer = new openCascade.TopExp_Explorer_2(
    myBody.Shape(),
    openCascade.TopAbs_ShapeEnum.TopAbs_FACE,
    openCascade.TopAbs_ShapeEnum.TopAbs_SHAPE
  );
  for (; aFaceExplorer.More(); aFaceExplorer.Next()) {
    const aFace = openCascade.TopoDS.Face_1(aFaceExplorer.Current());
    // Check if <aFace> is the top face of the bottle's neck
    const aSurface = openCascade.BRep_Tool.Surface_2(aFace);
    if (aSurface.get().$$.ptrType.name === "Geom_Plane*") {
      const aPlane = new openCascade.Handle_Geom_Plane_2(aSurface.get()).get();
      const aPnt = aPlane.Location();
      const aZ = aPnt.Z();
      if (aZ > zMax) {
        zMax = aZ;
        faceToRemove = new openCascade.TopExp_Explorer_2(
          aFace,
          openCascade.TopAbs_ShapeEnum.TopAbs_FACE,
          openCascade.TopAbs_ShapeEnum.TopAbs_SHAPE
        ).Current();
      }
    }
  }

  const facesToRemove = new openCascade.TopTools_ListOfShape_1();
  facesToRemove.Append_1(faceToRemove);
  const s = myBody.Shape();
  myBody = new openCascade.BRepOffsetAPI_MakeThickSolid();
  myBody.MakeThickSolidByJoin(
    s,
    facesToRemove,
    -myThickness / 50,
    1e-3,
    openCascade.BRepOffset_Mode.BRepOffset_Skin,
    false,
    false,
    openCascade.GeomAbs_JoinType.GeomAbs_Arc,
    false,
    new openCascade.Message_ProgressRange_1()
  );
  // Threading : Create Surfaces
  const aCyl1 = new openCascade.Geom_CylindricalSurface_1(
    new openCascade.gp_Ax3_2(neckAx2),
    myNeckRadius * 0.99
  );
  const aCyl2 = new openCascade.Geom_CylindricalSurface_1(
    new openCascade.gp_Ax3_2(neckAx2),
    myNeckRadius * 1.05
  );

  // Threading : Define 2D Curves
  const aPnt = new openCascade.gp_Pnt2d_3(2 * Math.PI, myNeckHeight / 2);
  const aDir = new openCascade.gp_Dir2d_4(2 * Math.PI, myNeckHeight / 4);
  const anAx2d = new openCascade.gp_Ax2d_2(aPnt, aDir);

  const aMajor = 2 * Math.PI;
  const aMinor = myNeckHeight / 10;

  const anEllipse1 = new openCascade.Geom2d_Ellipse_2(
    anAx2d,
    aMajor,
    aMinor,
    true
  );
  const anEllipse2 = new openCascade.Geom2d_Ellipse_2(
    anAx2d,
    aMajor,
    aMinor / 4,
    true
  );
  const anArc1 = new openCascade.Geom2d_TrimmedCurve(
    new openCascade.Handle_Geom2d_Curve_2(anEllipse1),
    0,
    Math.PI,
    true,
    true
  );
  const anArc2 = new openCascade.Geom2d_TrimmedCurve(
    new openCascade.Handle_Geom2d_Curve_2(anEllipse2),
    0,
    Math.PI,
    true,
    true
  );
  const tmp1 = anEllipse1.Value(0);
  const anEllipsePnt1 = new openCascade.gp_Pnt2d_3(tmp1.X(), tmp1.Y());
  const tmp2 = anEllipse1.Value(Math.PI);
  const anEllipsePnt2 = new openCascade.gp_Pnt2d_3(tmp2.X(), tmp2.Y());

  const aSegment = new openCascade.GCE2d_MakeSegment_1(
    anEllipsePnt1,
    anEllipsePnt2
  );
  // Threading : Build Edges and Wires
  const anEdge1OnSurf1 = new openCascade.BRepBuilderAPI_MakeEdge_30(
    new openCascade.Handle_Geom2d_Curve_2(anArc1),
    new openCascade.Handle_Geom_Surface_2(aCyl1)
  );
  const anEdge2OnSurf1 = new openCascade.BRepBuilderAPI_MakeEdge_30(
    new openCascade.Handle_Geom2d_Curve_2(aSegment.Value().get()),
    new openCascade.Handle_Geom_Surface_2(aCyl1)
  );
  const anEdge1OnSurf2 = new openCascade.BRepBuilderAPI_MakeEdge_30(
    new openCascade.Handle_Geom2d_Curve_2(anArc2),
    new openCascade.Handle_Geom_Surface_2(aCyl2)
  );
  const anEdge2OnSurf2 = new openCascade.BRepBuilderAPI_MakeEdge_30(
    new openCascade.Handle_Geom2d_Curve_2(aSegment.Value().get()),
    new openCascade.Handle_Geom_Surface_2(aCyl2)
  );
  const threadingWire1 = new openCascade.BRepBuilderAPI_MakeWire_3(
    anEdge1OnSurf1.Edge(),
    anEdge2OnSurf1.Edge()
  );
  const threadingWire2 = new openCascade.BRepBuilderAPI_MakeWire_3(
    anEdge1OnSurf2.Edge(),
    anEdge2OnSurf2.Edge()
  );
  openCascade.BRepLib.BuildCurves3d_2(threadingWire1.Wire());
  openCascade.BRepLib.BuildCurves3d_2(threadingWire2.Wire());
  openCascade.BRepLib.BuildCurves3d_2(threadingWire1.Wire());
  openCascade.BRepLib.BuildCurves3d_2(threadingWire2.Wire());

  // Create Threading
  const aTool = new openCascade.BRepOffsetAPI_ThruSections(true, false, 1.0e-6);
  aTool.AddWire(threadingWire1.Wire());
  aTool.AddWire(threadingWire2.Wire());
  aTool.CheckCompatibility(false);

  const myThreading = aTool.Shape();

  // Building the Resulting Compound
  const aRes = new openCascade.TopoDS_Compound();
  const aBuilder = new openCascade.BRep_Builder();
  aBuilder.MakeCompound(aRes);
  aBuilder.Add(aRes, myBody.Shape());
  aBuilder.Add(aRes, myThreading);

  return aRes;
};

export { addShapeToScene, makeBottle };
