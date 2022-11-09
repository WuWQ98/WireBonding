from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Controller, IGESControl_Writer
from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_MakeEdge, BRepBuilderAPI_MakeWire, BRepBuilderAPI_MakeFace
from OCC.Core.BRepOffsetAPI import BRepOffsetAPI_MakePipe
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeSphere, BRepPrimAPI_MakeBox, BRepPrimAPI_MakeCylinder
from OCC.Core.gp import gp_Circ, gp_Ax2, gp_Pnt, gp_Dir, gp_Trsf, gp_Vec, gp_Pln, gp_Ax1
from OCC.Core.TopLoc import TopLoc_Location
from OCC.Core.TColgp import TColgp_HArray1OfPnt
from OCC.Core.GeomAPI import GeomAPI_Interpolate
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Fuse, BRepAlgoAPI_Cut
from OCC.Core.ChFi2d import ChFi2d_AnaFilletAlgo
from OCC.Core.GeomAdaptor import GeomAdaptor_Curve
from OCC.Core.GCPnts import GCPnts_UniformAbscissa
from OCC.Display.SimpleGui import init_display
import math
from functools import reduce


class Occ_api:
    wire = {}
    weldMetal = {}
    metalGasket = {}
    mosCapacitance = {}
    tube = {}
    fins = {}
    pins = {}

    def __init__(self):
        pass

    def display(self):
        shapeList = []
        for shapeDict in [self.wire, self.weldMetal, self.metalGasket, self.mosCapacitance, self.tube, self.pins,
                          self.fins]:
            if len(shapeDict) > 0:
                for Shape in shapeDict.values():
                    shapeList.append(Shape)
        display, start_display, add_menu, add_function_to_menu = init_display()
        if len(shapeList) != 0:
            shape = reduce(self.fuseShape, shapeList)
            display.DisplayShape(shape, update=True)
        start_display()

    def fuseShape(self, shape1, shape2):
        return BRepAlgoAPI_Fuse(shape1, shape2).Shape()

    def saveAsStep(self, shapeList, path):
        if len(shapeList) == 0:
            print("No shapes to save")
        else:
            writer = STEPControl_Writer()
            shape = reduce(self.fuseShape, shapeList)
            writer.Transfer(shape, STEPControl_AsIs)
            writer.Write(path)

    def saveAsIGES(self, shapeList, path):
        if len(shapeList) == 0:
            print("No shapes to save")
        else:
            IGESControl_Controller.Init()
            writer = IGESControl_Writer()
            shape = reduce(self.fuseShape, shapeList)
            writer.AddShape(shape)
            writer.ComputeModel()
            writer.Write(path)

    def splitCurve(self, curve, splitNumber=100):
        GAC = GeomAdaptor_Curve(curve)
        UA = GCPnts_UniformAbscissa(GAC, splitNumber)
        params = []
        gp_points = []
        if UA.IsDone():
            for idx in range(UA.NbPoints()):
                param = UA.Parameter(idx + 1)
                params.append(param)
                point = gp_Pnt()
                curve.D0(param, point)
                gp_points.append(point)
        points = []
        for value in gp_points:
            points.append([value.X(), value.Y(), value.Z()])
        return points

    def filletEdges(self, edge1, edge2):
        radius = 0.001
        f = ChFi2d_AnaFilletAlgo()
        f.Init(edge1, edge2, gp_Pln())
        f.Perform(radius)
        return f.Result(edge1, edge2)

    def makeStraightPipe(self, point1, point2, radius):
        edge = BRepBuilderAPI_MakeEdge(gp_Pnt(point1[0], point1[1], point1[2]),
                                       gp_Pnt(point2[0], point2[1], point2[2])).Edge()
        wire = BRepBuilderAPI_MakeWire(edge).Wire()
        circle = None
        if point2[0] - point1[0] != 0:
            circle = gp_Circ(gp_Ax2(gp_Pnt(point1[0], point1[1], point1[2]),
                                    gp_Dir(1, (point2[1] - point1[1]) / (point2[0] - point1[0]), 0)), radius)
        else:
            circle = gp_Circ(gp_Ax2(gp_Pnt(point1[0], point1[1], point1[2]),
                                    gp_Dir(0, (point2[1] - point1[1]) / math.fabs(point2[1] - point1[1]), 0)), radius)
        circle_edge = BRepBuilderAPI_MakeEdge(circle).Edge()
        circle_wire = BRepBuilderAPI_MakeWire(circle_edge).Wire()
        circle_face = BRepBuilderAPI_MakeFace(circle_wire).Face()
        pipe = BRepOffsetAPI_MakePipe(wire, circle_face).Shape()
        return pipe

    def makeCuboid(self, position, dx, dy, dz):
        return BRepPrimAPI_MakeBox(gp_Pnt(position[0] - 0.5 * dx, position[1] - 0.5 * dy, position[2] - 0.5 * dz), dx,
                                   dy, dz).Shape()

    def makeSphere(self, point, radius):
        return BRepPrimAPI_MakeSphere(gp_Pnt(point[0], point[1], point[2]), radius).Shape()

    def makeBoxBetweenPoints(self, point1, point2, width, height):
        dx = point2[0] - point1[0]
        dz = point2[2] - point1[2]
        rad = math.atan(dx / dz) if dz != 0 else math.pi / 2
        trsf1 = gp_Trsf()
        trsf1.SetRotation(gp_Ax1(gp_Pnt(0, 0, 0), gp_Dir(0, 1, 0)), rad)
        trsf2 = gp_Trsf()
        trsf2.SetTranslation(gp_Vec(point1[0], point1[1], point1[2]))
        trsf = trsf2.Multiplied(trsf1)
        profile_wire = self.makeWire(
            [[-width / 2, -height / 2, 0], [-width / 2, height / 2, 0], [width / 2, height / 2, 0],
             [width / 2, -height / 2, 0], [-width / 2, -height / 2, 0]])
        profile = BRepBuilderAPI_MakeFace(profile_wire).Face()
        profile.Move(TopLoc_Location(trsf))
        return profile

    def makeCylinder(self, position, height, radius):
        trsf1 = gp_Trsf()
        trsf1.SetTranslation(gp_Vec(position[0], position[1] + height / 2, position[2]))
        trsf2 = gp_Trsf()
        trsf2.SetRotation(gp_Ax1(gp_Pnt(0, 0, 0), gp_Dir(1, 0, 0)), math.pi / 2)
        trsf = trsf1.Multiplied(trsf2)
        cylinder = BRepPrimAPI_MakeCylinder(radius / 2, height).Shape()
        cylinder.Move(TopLoc_Location(trsf))
        return cylinder

    def makeWire(self, points):
        wire = BRepBuilderAPI_MakeWire()
        for idx in range(len(points) - 1):
            edge = BRepBuilderAPI_MakeEdge(gp_Pnt(points[idx][0], points[idx][1], points[idx][2]),
                                           gp_Pnt(points[idx + 1][0], points[idx + 1][1], points[idx + 1][2])).Edge()
            wire.Add(edge)
        wire.Build()
        return wire.Wire()

    # def generateWire(self, points, radius, weldMetalThickness, position, ):
    #     array = TColgp_HArray1OfPnt(1, len(points))
    #     for idx, point in enumerate(points):
    #         array.SetValue(idx + 1, gp_Pnt(point[0], point[1], point[2]))
    #     array_interpolate = GeomAPI_Interpolate(array, False, 1e-6)
    #     array_interpolate.Perform()
    #     bspline = array_interpolate.Curve()
    #
    #     trsf = gp_Trsf()
    #     trsf.SetTranslation(gp_Vec(position[0], position[1], position[2]))
    #
    #     wire = BRepOffsetAPI_ThruSections(True, False, 1.0e-6)
    #     for idx in range(len(points) - 1):
    #         circle = gp_Circ(gp_Ax2(gp_Pnt(points[idx][0], points[idx][1], points[idx][2]), gp_Dir(1, (
    #                 points[idx + 1][1] - points[idx][1]) / (points[idx + 1][0] - points[idx][0]), 0)), radius)
    #         circle_edge = BRepBuilderAPI_MakeEdge(circle).Edge()
    #         circle_wire = BRepBuilderAPI_MakeWire(circle_edge).Wire()
    #         wire.AddWire(circle_wire)
    #     wire.Build()
    #     wire = wire.Shape()
    #     weldMetalFirst = BRepPrimAPI_MakeSphere(gp_Pnt(points[0][0], points[0][1], points[0][2]),
    #                                             weldMetalThickness).Shape()
    #     weldMetalLast = BRepPrimAPI_MakeSphere(
    #         gp_Pnt(points[len(points) - 1][0], points[len(points) - 1][1], points[len(points) - 1][2]),
    #         weldMetalThickness).Shape()
    #     wire = BRepAlgoAPI_Fuse(wire, weldMetalFirst).Shape()
    #     wire = BRepAlgoAPI_Fuse(wire, weldMetalLast).Shape()
    #     wire.Move(TopLoc_Location(trsf))
    #     self.shapes.append(wire)

    # def generateWire(self, points, radius, weldMetalThickness, position, ):
    #     pipes = []
    #     for idx in range(len(points) - 1):
    #         pipe = self.makeStraightPipe(points[idx], points[idx + 1], radius)
    #         pipes.append(pipe)
    #     spheres = []
    #     for idx, point in enumerate(points):
    #         if (idx != 0) & (idx != len(points) - 1):
    #             spheres.append(self.makeSphere(point, radius))
    #         else:
    #             spheres.append(self.makeSphere(point, weldMetalThickness))
    #
    #     for pipe in pipes:
    #         self.shapes.append(pipe)
    #
    #     for sphere in spheres:
    #         self.shapes.append(sphere)

    #
    # def generateWire(self, points, radius, weldMetalThickness, position, ):
    #     makeWire = BRepBuilderAPI_MakeWire()
    #     edges = []
    #     for idx in range(len(points) - 1):
    #         edge = BRepBuilderAPI_MakeEdge(gp_Pnt(points[idx][0], points[idx][1], points[idx][2]),
    #                                        gp_Pnt(points[idx + 1][0], points[idx + 1][1], points[idx + 1][2]))
    #         edges.append(edge.Edge())
    #     fillets = []
    #     for idx in range(len(edges) - 1):
    #         fillet = self.filletEdges(edges[idx], edges[idx + 1])
    #         fillets.append(fillet)
    #     for idx in range(len(fillets)):
    #         makeWire.Add(edges[idx])
    #         makeWire.Add(fillets[idx])
    #     makeWire.Add(edges[len(edges)-1])
    #     makeWire.Build()
    #     wire = makeWire.Wire()
    #     circle = gp_Circ(gp_Ax2(gp_Pnt(points[0][0], points[0][1], points[0][2]),
    #                             gp_Dir(1, (points[1][1] - points[0][1]) / (points[1][0] - points[0][0]), 0)), radius)
    #     circle_edge = BRepBuilderAPI_MakeEdge(circle).Edge()
    #     circle_wire = BRepBuilderAPI_MakeWire(circle_edge).Wire()
    #     circle_face = BRepBuilderAPI_MakeFace(circle_wire).Face()
    #     pipe = BRepOffsetAPI_MakePipe(wire, circle_face).Shape()
    #     self.shapes.append(pipe)

    def generateWire(self, name, points, wireAmount, wireGap, radius, weldMetalShape):
        array = TColgp_HArray1OfPnt(1, len(points))
        for idx, point in enumerate(points):
            array.SetValue(idx + 1, gp_Pnt(point[0], point[1], point[2]))
        array_interpolate = GeomAPI_Interpolate(array, False, 1e-6)
        array_interpolate.Perform()
        bspline = array_interpolate.Curve()
        edge = BRepBuilderAPI_MakeEdge(bspline).Edge()
        wire = BRepBuilderAPI_MakeWire(edge).Wire()

        firstParam = bspline.FirstParameter()
        firstPoint = gp_Pnt()
        firstDerivative = gp_Vec()
        bspline.D1(firstParam, firstPoint, firstDerivative)

        circle = gp_Circ(gp_Ax2(gp_Pnt(points[0][0], points[0][1], points[0][2]),
                                gp_Dir(firstDerivative.X(), firstDerivative.Y(), firstDerivative.Z())), radius)
        circle_edge = BRepBuilderAPI_MakeEdge(circle).Edge()
        circle_wire = BRepBuilderAPI_MakeWire(circle_edge).Wire()
        circle_face = BRepBuilderAPI_MakeFace(circle_wire).Face()

        pipeList = []
        weldMetalList = []
        wireGapCount = 0
        for wireIdx in range(wireAmount):
            trsf = gp_Trsf()
            trsf.SetTranslation(gp_Vec(0, 0, wireGapCount))
            if wireIdx != wireAmount - 1:
                wireGapCount += wireGap[wireIdx]

            pipe = BRepOffsetAPI_MakePipe(wire, circle_face).Shape()
            pipe.Move(TopLoc_Location(trsf))
            pipeList.append(pipe)
            weldSphereFirst = BRepPrimAPI_MakeSphere(gp_Pnt(points[0][0], points[0][1], points[0][2]),
                                                     radius).Shape()
            weldMetalFirst = self.makeCuboid(
                [points[0][0], points[0][1] - 0.5 * weldMetalShape[1], points[0][2]], weldMetalShape[0],
                weldMetalShape[1], weldMetalShape[2]
            )
            weldSphereLast = BRepPrimAPI_MakeSphere(
                gp_Pnt(points[len(points) - 1][0], points[len(points) - 1][1], points[len(points) - 1][2]),
                radius).Shape()
            weldMetalLast = self.makeCuboid(
                [points[len(points) - 1][0], points[len(points) - 1][1] - 0.5 * weldMetalShape[1],
                 points[len(points) - 1][2]], weldMetalShape[0], weldMetalShape[1],
                weldMetalShape[2])
            weldMetal = BRepAlgoAPI_Fuse(weldMetalFirst, weldSphereFirst).Shape()
            weldMetal = BRepAlgoAPI_Fuse(weldMetal, weldSphereLast).Shape()
            weldMetal = BRepAlgoAPI_Fuse(weldMetal, weldMetalLast).Shape()
            weldMetal.Move(TopLoc_Location(trsf))
            weldMetalList.append(weldMetal)

        trsf = gp_Trsf()
        trsf.SetTranslation(gp_Vec(0, 0, -sum(wireGap) / 2))
        pipe = reduce(self.fuseShape, pipeList)
        pipe.Move(TopLoc_Location(trsf))
        self.wire[name] = pipe
        weldMetal = reduce(self.fuseShape, weldMetalList)
        weldMetal.Move(TopLoc_Location(trsf))
        self.weldMetal[name] = weldMetal

        return self.splitCurve(bspline)

    def generateTube(self, thickness, dx_inner, dy_inner, dz_inner, position, nameID):
        x_inner, y_inner, z_inner = position
        dx_outer = dx_inner + 2 * thickness
        dy_outer = dy_inner + 2 * thickness
        dz_outer = dz_inner + 2 * thickness
        x_outer, y_outer, z_outer = position
        cuboid_inner = self.makeCuboid([x_inner, y_inner, z_inner], dx_inner, dy_inner, dz_inner)
        cuboid_outer = self.makeCuboid([x_outer, y_outer, z_outer], dx_outer, dy_outer, dz_outer)
        tube = BRepAlgoAPI_Cut(cuboid_outer, cuboid_inner).Shape()
        self.tube[nameID] = tube

    def makeFins(self, points, width, height, nameID):
        if len(points) == 4:
            point1, point2, point3, point4 = points

            profile1 = self.makeBoxBetweenPoints(point1, point2, width, height)
            profile2 = self.makeBoxBetweenPoints(point2, point3, width, height)
            profile3 = self.makeBoxBetweenPoints(point3, point4, width, height)

            path1 = self.makeWire([point1, point2])
            path2 = self.makeWire([point2, point3])
            path3 = self.makeWire([point3, point4])

            part1 = BRepOffsetAPI_MakePipe(path1, profile1).Shape()
            part2 = BRepOffsetAPI_MakePipe(path2, profile2).Shape()
            part3 = BRepOffsetAPI_MakePipe(path3, profile3).Shape()

            connect1 = self.makeCylinder(point2, height, width)
            connect2 = self.makeCylinder(point3, height, width)

            shape = reduce(self.fuseShape, [part1, connect1, part2, connect2, part3])
            self.fins[nameID] = shape


if __name__ == "__main__":
    points = [[-5e-1, 17e-3, 0], [0, 10e-1, 0], [5e-1, 17e-3, 0]]
    occ_api = Occ_api()
    # occ_api.generateTube(10, 100, 100, 100, [0, 0, 0], "tube")
    occ_api.makeFins([[0, 0, 0], [0, 0, 50], [80, 0, 80], [160, 0, 80]], 15, 5, "fins")
    # print(occ_api.generateWire("test", points, 5, [1e-1, 2e-1, 3e-1, 4e-1], 12.5e-3, [25e-3, 17e-3, 25e-3]))
    # occ_api.saveAsStep("./file.stp")
    occ_api.saveAsIGES(occ_api.tube.values(), "./file.iges")
    occ_api.display()
