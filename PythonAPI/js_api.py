from PythonAPI.occ_api import Occ_api
import numpy as np
from scipy import integrate
import math
from functools import reduce
from PyQt5.QtCore import QObject, pyqtSlot, QVariant
import copy


# __name__ = "PythonAPI.js_api"
# from .wire1 import Wire1Group
# __name__ = "__main__"

def fit_wire3_func(x, z):
    x_extra1 = 2 * x[0, 1] - x[0, 0]
    x_extra2 = 2 * x[0, 1] - x[0, 2]
    z_extra1 = z[0, 0]
    z_extra2 = z[0, 2]
    x1 = np.array([x[0, 0], x[0, 1], x_extra1])
    z1 = np.array([z[0, 0], z[0, 1], z_extra1])
    x2 = np.array([x_extra2, x[0, 1], x[0, 2]])
    z2 = np.array([z_extra2, z[0, 1], z[0, 2]])
    p1 = np.polyfit(x1, z1, 2)
    p2 = np.polyfit(x2, z2, 2)
    return np.array([p1, p2])


def calc_from_three_points(bond_total, number, cond, frequency, X, Z, gap, rbw, ep, tm):
    adjustUnitsForNarray = np.vectorize(lambda x: x * 1e-6)

    gap = np.array([gap])
    X = np.array([X])
    Z = np.array([Z])
    self_inductance = 0
    mutual_inductance = 0
    loop_inductance = 0
    R_single = 0
    R_total = 0
    Q = 0
    if bond_total == len(gap) + 1:
        print("输入参数异常")
        print("提示：键合线阵列单元数与间距矩阵元素数量相差为1")
    else:
        u0 = 4 * math.pi * 1e-7
        p = fit_wire3_func(adjustUnitsForNarray(X), adjustUnitsForNarray(Z))
        f_lbw1 = lambda x: math.sqrt(1 + (2 * p[0, 0] * x + p[0, 1]) ** 2)
        lbw1 = integrate.quad(f_lbw1, X[0, 0] * 1e-6, X[0, 1] * 1e-6)[0]
        f_lbw2 = lambda x: math.sqrt(1 + (2 * p[1, 0] * x + p[1, 1]) ** 2)
        lbw2 = integrate.quad(f_lbw2, X[0, 1] * 1e-6, X[0, 2] * 1e-6)[0]
        lbw = lbw1 + lbw2
        rbw *= 1 + ep * tm
        deta = 1 / math.sqrt(math.pi * u0 * frequency * 1e9 * cond)
        deta1 = deta * (1 - math.exp(-rbw * 1e-6 / deta))
        gama = 0.62006 * rbw * 1e-6 / deta
        t = 0.189774 / (1 + 0.272481 * (gama ** 1.82938 - gama ** (-0.99457)) ** 2) ** 1.0941
        R_single = lbw / cond / math.pi / (2 * rbw * 1e-6 * deta1 - deta ** 2) / (1 + t)
        Rs = math.sqrt(math.pi * u0 * frequency * 1e9 / cond)

        f1_1 = lambda x, y: (1 + (2 * p[0, 0] * x + p[0, 1]) * (2 * p[0, 0] * y + p[0, 1])) / math.sqrt(
            (x - y) ** 2 + (p[0, 0] * x ** 2 - p[0, 0] * y ** 2 + p[0, 1] * (x - y)) ** 2 + (rbw * 1e-6) ** 2)
        Q1_1 = integrate.dblquad(f1_1, X[0, 0] * 1e-6, X[0, 1] * 1e-6, X[0, 0] * 1e-6, X[0, 1] * 1e-6)[0]

        f1_2 = lambda x, y: (1 + (2 * p[1, 0] * x + p[1, 1]) * (2 * p[1, 0] * y + p[1, 1])) / math.sqrt(
            (x - y) ** 2 + (p[1, 0] * x ** 2 - p[1, 0] * y ** 2 + p[1, 1] * (x - y)) ** 2 + (rbw * 1e-6) ** 2)
        Q1_2 = integrate.dblquad(f1_2, X[0, 1] * 1e-6, X[0, 2] * 1e-6, X[0, 1] * 1e-6, X[0, 2] * 1e-6)[0]

        Q1 = Q1_1 + Q1_2
        skin = Rs * lbw / (4 * math.pi ** 2 * rbw * 1e-6 * frequency * 1e9) * 1e9
        zigan = (u0 / 4 / math.pi) * Q1 * 1e9 + skin

        M_q1 = 0
        ind_matrix_1 = []
        for i in np.arange(2, bond_total + 1):
            f2_1 = lambda x, y: (1 + (2 * p[0, 0] * x + p[0, 1]) * (2 * p[0, 0] * y + p[0, 1])) / math.sqrt(
                (x - y) ** 2 + (p[0, 0] * x ** 2 - p[0, 0] * y ** 2 + p[0, 1] * (x - y)) ** 2 + (
                        (np.sum(gap[0, 0:i - 1])) * 1e-6 + rbw * 1e-6) ** 2)
            Q2_1 = integrate.dblquad(f2_1, X[0, 0] * 1e-6, X[0, 1] * 1e-6, X[0, 0] * 1e-6, X[0, 1] * 1e-6)[0] * 100

            f2_2 = lambda x, y: (1 + (2 * p[1, 0] * x + p[1, 1]) * (2 * p[1, 0] * y + p[1, 1])) / math.sqrt(
                (x - y) ** 2 + (p[1, 0] * x ** 2 - p[1, 0] * y ** 2 + p[1, 1] * (x - y)) ** 2 + (
                        (np.sum(gap[0, 0:i - 1])) * 1e-6 + rbw * 1e-6) ** 2)
            Q2_2 = integrate.dblquad(f2_2, X[0, 1] * 1e-6, X[0, 2] * 1e-6, X[0, 1] * 1e-6, X[0, 2] * 1e-6)[0] * 100

            Q2 = Q2_1 + Q2_2
            M_Q = Q2
            ind_matrix_1.append(M_Q)
            M_q1 += M_Q
        ind_matrix_1.insert(0, 0)
        ind_matrix_end = list(reversed(ind_matrix_1))
        if bond_total == 1 and gap.shape[1] == 0:
            self_inductance = zigan
            mutual_inductance = 0
            loop_inductance = self_inductance
        elif bond_total == 2 and gap.shape[1] == 1:
            self_inductance = zigan
            mutual_inductance = M_q1
            loop_inductance = 0.5 * (self_inductance + M_q1)
        elif bond_total == 0:
            self_inductance = 0
            mutual_inductance = 0
            loop_inductance = 0
        else:
            mutual_inductance_total = []
            ind_matrix_n = np.zeros((bond_total, bond_total))
            for n in np.arange(2, bond_total):
                M_q = 0
                for k in np.arange(1, n):
                    f3_1 = lambda x, y: (1 + (2 * p[0, 0] * x + p[0, 1]) * (2 * p[0, 0] * y + p[0, 1])) / math.sqrt(
                        (x - y) ** 2 + (p[0, 0] * x ** 2 - p[0, 0] * y ** 2 + p[0, 1] * (x - y)) ** 2 + (
                                (np.sum(gap[0, 0:n - k])) * 1e-6 + rbw * 1e-6) ** 2)
                    Q3_1 = integrate.dblquad(f3_1, X[0, 0] * 1e-6, X[0, 1] * 1e-6, X[0, 0] * 1e-6, X[0, 1] * 1e-6)[
                               0] * 100

                    f3_2 = lambda x, y: (1 + (2 * p[1, 0] * x + p[1, 1]) * (2 * p[1, 0] * y + p[1, 1])) / math.sqrt(
                        (x - y) ** 2 + (p[1, 0] * x ** 2 - p[1, 0] * y ** 2 + p[1, 1] * (x - y)) ** 2 + (
                                (np.sum(gap[0, 0:n - k])) * 1e-6 + rbw * 1e-6) ** 2)
                    Q3_2 = integrate.dblquad(f3_2, X[0, 1] * 1e-6, X[0, 2] * 1e-6, X[0, 1] * 1e-6, X[0, 2] * 1e-6)[
                               0] * 100

                    Q3 = Q3_1 + Q3_2
                    ind_matrix_n[n - 1, k - 1] = Q3
                    M_q += Q3
                for j in np.arange(1, bond_total - n + 1):
                    f4_1 = lambda x, y: (1 + (2 * p[0, 0] * x + p[0, 1]) * (2 * p[0, 0] * y + p[0, 1])) / math.sqrt(
                        (x - y) ** 2 + (p[0, 0] * x ** 2 - p[0, 0] * y ** 2 + p[0, 1] * (x - y)) ** 2 + (
                                (np.sum(gap[0, n - 1:n + j - 1])) * 1e-6 + rbw * 1e-6) ** 2)
                    Q4_1 = integrate.dblquad(f4_1, X[0, 0] * 1e-6, X[0, 1] * 1e-6, X[0, 0] * 1e-6, X[0, 1] * 1e-6)[
                               0] * 100

                    f4_2 = lambda x, y: (1 + (2 * p[1, 0] * x + p[1, 1]) * (2 * p[1, 0] * y + p[1, 1])) / math.sqrt(
                        (x - y) ** 2 + (p[1, 0] * x ** 2 - p[1, 0] * y ** 2 + p[1, 1] * (x - y)) ** 2 + (
                                (np.sum(gap[0, n - 1:n + j - 1])) * 1e-6 + rbw * 1e-6) ** 2)
                    Q4_2 = integrate.dblquad(f4_2, X[0, 1] * 1e-6, X[0, 2] * 1e-6, X[0, 1] * 1e-6, X[0, 2] * 1e-6)[
                               0] * 100

                    Q4 = Q4_1 + Q4_2
                    ind_matrix_n[n - 1, n + j - 1] = Q4
                    M_q += Q4
                mutual_inductance_total.append(M_q)
            ind_matrix = np.zeros((bond_total, bond_total))
            ind_matrix[0, :] = np.array([ind_matrix_1])
            ind_matrix[bond_total - 1, :] = np.array([ind_matrix_end])
            ind_matrix += ind_matrix_n + zigan * np.eye(bond_total)
            deta = np.linalg.det(ind_matrix)
            data_extra = []
            for a in np.arange(1, bond_total + 1):
                subst = copy.deepcopy(ind_matrix)
                subst[:, a - 1] = 1
                kk = np.linalg.det(subst)
                data_extra.append(kk)
            self_inductance = zigan
            mutual_inductance_list = [M_q1, *mutual_inductance_total, M_q1]
            mutual_inductance = mutual_inductance_list[number]
            loop_inductance = math.fabs(deta / sum(data_extra))
        R_total = R_single / bond_total
        Q = 2 * math.pi * frequency * loop_inductance * bond_total / R_total
    return {"self_inductance": self_inductance, "mutual_inductance": mutual_inductance,
            "loop_inductance": loop_inductance, "R_single": R_single, "R_total": R_total, "Q": Q}


def calc_from_five_points(bond_total, number, cond, frequency, X, Z, gap, rbw, ep, tm):
    rbw *= 1e-6
    X = list(map(lambda x: x * 1e-6, X))
    Z = list(map(lambda x: x * 1e-6, Z))
    gap = list(map(lambda x: x * 1e-6, gap))

    gap = np.array([gap])
    X = np.array([X])
    Z = np.array([Z])
    self_inductance = 0
    mutual_inductance = 0
    loop_inductance = 0
    R_single = 0
    R_total = 0
    Q = 0
    if bond_total == len(gap) + 1:
        print("输入参数异常")
        print("提示：键合线阵列单元数与间距矩阵元素数量相差为1")
    else:
        u0 = 4 * math.pi * 1e-7
        lbw = 0
        for pp in range(X.shape[1] - 1):
            lbw += math.sqrt((X[0, pp + 1] - X[0, pp]) ** 2 + (Z[0, pp + 1] - Z[0, pp]) ** 2)
        rbw *= 1 + ep * tm
        deta = 1 / math.sqrt(math.pi * u0 * frequency * 1e9 * cond)
        deta1 = deta * (1 - math.exp(-rbw / deta))
        gama = 0.62006 * rbw / deta
        t = 0.189774 / (1 + 0.272481 * (gama ** 1.82938 - gama ** (-0.99457)) ** 2) ** 1.0941
        R_single = lbw / cond / math.pi / (2 * rbw * deta1 - deta ** 2) / (1 + t)
        Rs = math.sqrt(math.pi * u0 * frequency * 1e9 / cond)

        f1_1 = lambda x, y: (1 + ((Z[0, 1] - Z[0, 0]) / (X[0, 1] - X[0, 0])) ** 2) / math.sqrt(
            (x - y) ** 2 + (((Z[0, 1] - Z[0, 0]) / (X[0, 1] - X[0, 0])) * (x - y)) ** 2 + rbw ** 2)
        Q1_1 = integrate.dblquad(f1_1, X[0, 0], X[0, 1], X[0, 0], X[0, 1])[0]

        f1_2 = lambda x, y: (1 + ((Z[0, 2] - Z[0, 1]) / (X[0, 2] - X[0, 1])) ** 2) / math.sqrt(
            (x - y) ** 2 + (((Z[0, 2] - Z[0, 1]) / (X[0, 2] - X[0, 1])) * (x - y)) ** 2 + rbw ** 2)
        Q1_2 = integrate.dblquad(f1_2, X[0, 1], X[0, 2], X[0, 1], X[0, 2])[0]

        f1_3 = lambda x, y: (1 + ((Z[0, 3] - Z[0, 2]) / (X[0, 3] - X[0, 2])) ** 2) / math.sqrt(
            (x - y) ** 2 + (((Z[0, 3] - Z[0, 2]) / (X[0, 3] - X[0, 2])) * (x - y)) ** 2 + rbw ** 2)
        Q1_3 = integrate.dblquad(f1_3, X[0, 2], X[0, 3], X[0, 2], X[0, 3])[0]

        f1_4 = lambda x, y: (1 + ((Z[0, 4] - Z[0, 3]) / (X[0, 4] - X[0, 3])) ** 2) / math.sqrt(
            (x - y) ** 2 + (((Z[0, 4] - Z[0, 3]) / (X[0, 4] - X[0, 3])) * (x - y)) ** 2 + rbw ** 2)
        Q1_4 = integrate.dblquad(f1_4, X[0, 3], X[0, 4], X[0, 3], X[0, 4])[0]

        Q1 = Q1_1 + Q1_2 + Q1_3 + Q1_4
        skin = Rs * lbw / (4 * math.pi ** 2 * rbw * frequency * 1e9) * 1e9
        zigan = (u0 / 4 / math.pi) * Q1 * 1e9 + skin

        M_q1 = 0
        ind_matrix_1 = []
        for i in np.arange(2, bond_total + 1):
            f2_1 = lambda x, y: (1 + ((Z[0, 1] - Z[0, 0]) / (X[0, 1] - X[0, 0])) ** 2) / math.sqrt(
                (x - y) ** 2 + (((Z[0, 1] - Z[0, 0]) / (X[0, 1] - X[0, 0])) * (x - y)) ** 2 + (
                        np.sum(gap[0, 0:i - 1]) + rbw) ** 2)
            Q2_1 = integrate.dblquad(f2_1, X[0, 0], X[0, 1], X[0, 0], X[0, 1])[0] * 100

            f2_2 = lambda x, y: (1 + ((Z[0, 2] - Z[0, 1]) / (X[0, 2] - X[0, 1])) ** 2) / math.sqrt(
                (x - y) ** 2 + (((Z[0, 2] - Z[0, 1]) / (X[0, 2] - X[0, 1])) * (x - y)) ** 2 + (
                        np.sum(gap[0, 0:i - 1]) + rbw) ** 2)
            Q2_2 = integrate.dblquad(f2_2, X[0, 1], X[0, 2], X[0, 1], X[0, 2])[0] * 100

            f2_3 = lambda x, y: (1 + ((Z[0, 3] - Z[0, 2]) / (X[0, 3] - X[0, 2])) ** 2) / math.sqrt(
                (x - y) ** 2 + (((Z[0, 3] - Z[0, 2]) / (X[0, 3] - X[0, 2])) * (x - y)) ** 2 + (
                        np.sum(gap[0, 0:i - 1]) + rbw) ** 2)
            Q2_3 = integrate.dblquad(f2_3, X[0, 2], X[0, 3], X[0, 2], X[0, 3])[0] * 100

            f2_4 = lambda x, y: (1 + ((Z[0, 4] - Z[0, 3]) / (X[0, 4] - X[0, 3])) ** 2) / math.sqrt(
                (x - y) ** 2 + (((Z[0, 4] - Z[0, 3]) / (X[0, 4] - X[0, 3])) * (x - y)) ** 2 + (
                        np.sum(gap[0, 0:i - 1]) + rbw) ** 2)
            Q2_4 = integrate.dblquad(f2_4, X[0, 3], X[0, 4], X[0, 3], X[0, 4])[0] * 100
            Q2 = Q2_1 + Q2_2 + Q2_3 + Q2_4
            M_Q = Q2
            ind_matrix_1.append(M_Q)
            M_q1 += M_Q
        ind_matrix_1.insert(0, 0)
        ind_matrix_end = list(reversed(ind_matrix_1))
        if bond_total == 1 and gap.shape[1] == 0:
            self_inductance = zigan
            mutual_inductance = 0
            loop_inductance = self_inductance
        elif bond_total == 2 and gap.shape[1] == 1:
            self_inductance = zigan
            mutual_inductance = M_q1
            loop_inductance = 0.5 * (self_inductance + M_q1)
        elif bond_total == 0:
            self_inductance = 0
            mutual_inductance = 0
            loop_inductance = 0
        else:
            mutual_inductance_total = []
            ind_matrix_n = np.zeros((bond_total, bond_total))
            for n in np.arange(2, bond_total):
                M_q = 0
                for k in np.arange(1, n):
                    f3_1 = lambda x, y: (1 + ((Z[0, 1] - Z[0, 0]) / (X[0, 1] - X[0, 0])) ** 2) / math.sqrt(
                        (x - y) ** 2 + (((Z[0, 1] - Z[0, 0]) / (X[0, 1] - X[0, 0])) * (x - y)) ** 2 + (
                                np.sum(gap[0, 0:n - k]) + rbw) ** 2)
                    Q3_1 = integrate.dblquad(f3_1, X[0, 0], X[0, 1], X[0, 0], X[0, 1])[0] * 100

                    f3_2 = lambda x, y: (1 + ((Z[0, 2] - Z[0, 1]) / (X[0, 2] - X[0, 1])) ** 2) / math.sqrt(
                        (x - y) ** 2 + (((Z[0, 2] - Z[0, 1]) / (X[0, 2] - X[0, 1])) * (x - y)) ** 2 + (
                                np.sum(gap[0, 0:n - k]) + rbw) ** 2)
                    Q3_2 = integrate.dblquad(f3_2, X[0, 1], X[0, 2], X[0, 1], X[0, 2])[0] * 100

                    f3_3 = lambda x, y: (1 + ((Z[0, 3] - Z[0, 2]) / (X[0, 3] - X[0, 2])) ** 2) / math.sqrt(
                        (x - y) ** 2 + (((Z[0, 3] - Z[0, 2]) / (X[0, 3] - X[0, 2])) * (x - y)) ** 2 + (
                                np.sum(gap[0, 0:n - k]) + rbw) ** 2)
                    Q3_3 = integrate.dblquad(f3_3, X[0, 2], X[0, 3], X[0, 2], X[0, 3])[0] * 100

                    f3_4 = lambda x, y: (1 + ((Z[0, 4] - Z[0, 3]) / (X[0, 4] - X[0, 3])) ** 2) / math.sqrt(
                        (x - y) ** 2 + (((Z[0, 4] - Z[0, 3]) / (X[0, 4] - X[0, 3])) * (x - y)) ** 2 + (
                                np.sum(gap[0, 0:n - k]) + rbw) ** 2)
                    Q3_4 = integrate.dblquad(f3_4, X[0, 3], X[0, 4], X[0, 3], X[0, 4])[0] * 100

                    Q3 = Q3_1 + Q3_2 + Q3_3 + Q3_4
                    ind_matrix_n[n - 1, k - 1] = Q3
                    M_q += Q3
                for j in np.arange(1, bond_total - n + 1):
                    f4_1 = lambda x, y: (1 + ((Z[0, 1] - Z[0, 0]) / (X[0, 1] - X[0, 0])) ** 2) / math.sqrt(
                        (x - y) ** 2 + (((Z[0, 1] - Z[0, 0]) / (X[0, 1] - X[0, 0])) * (x - y)) ** 2 + (
                                np.sum(gap[0, n - 1:n + j - 1]) + rbw) ** 2)
                    Q4_1 = integrate.dblquad(f4_1, X[0, 0], X[0, 1], X[0, 0], X[0, 1])[0] * 100

                    f4_2 = lambda x, y: (1 + ((Z[0, 2] - Z[0, 1]) / (X[0, 2] - X[0, 1])) ** 2) / math.sqrt(
                        (x - y) ** 2 + (((Z[0, 2] - Z[0, 1]) / (X[0, 2] - X[0, 1])) * (x - y)) ** 2 + (
                                np.sum(gap[0, n - 1:n + j - 1]) + rbw) ** 2)
                    Q4_2 = integrate.dblquad(f4_2, X[0, 1], X[0, 2], X[0, 1], X[0, 2])[0] * 100

                    f4_3 = lambda x, y: (1 + ((Z[0, 3] - Z[0, 2]) / (X[0, 3] - X[0, 2])) ** 2) / math.sqrt(
                        (x - y) ** 2 + (((Z[0, 3] - Z[0, 2]) / (X[0, 3] - X[0, 2])) * (x - y)) ** 2 + (
                                np.sum(gap[0, n - 1:n + j - 1]) + rbw) ** 2)
                    Q4_3 = integrate.dblquad(f4_3, X[0, 2], X[0, 3], X[0, 2], X[0, 3])[0] * 100

                    f4_4 = lambda x, y: (1 + ((Z[0, 4] - Z[0, 3]) / (X[0, 4] - X[0, 3])) ** 2) / math.sqrt(
                        (x - y) ** 2 + (((Z[0, 4] - Z[0, 3]) / (X[0, 4] - X[0, 3])) * (x - y)) ** 2 + (
                                np.sum(gap[0, n - 1:n + j - 1]) + rbw) ** 2)
                    Q4_4 = integrate.dblquad(f4_4, X[0, 3], X[0, 4], X[0, 3], X[0, 4])[0] * 100

                    Q4 = Q4_1 + Q4_2 + Q4_3 + Q4_4
                    ind_matrix_n[n - 1, n + j - 1] = Q4
                    M_q += Q4
                mutual_inductance_total.append(M_q)
            ind_matrix = np.zeros((bond_total, bond_total))
            ind_matrix[0, :] = np.array([ind_matrix_1])
            ind_matrix[bond_total - 1, :] = np.array([ind_matrix_end])
            ind_matrix += ind_matrix_n + zigan * np.eye(bond_total)
            deta = np.linalg.det(ind_matrix)
            data_extra = []
            for a in np.arange(1, bond_total + 1):
                subst = copy.deepcopy(ind_matrix)
                subst[:, a - 1] = 1
                kk = np.linalg.det(subst)
                data_extra.append(kk)
            self_inductance = zigan
            mutual_inductance_list = [M_q1, *mutual_inductance_total, M_q1]
            mutual_inductance = mutual_inductance_list[number]
            loop_inductance = math.fabs(deta / sum(data_extra))
        R_total = R_single / bond_total
        Q = 2 * math.pi * frequency * loop_inductance * bond_total / R_total
    return {"self_inductance": self_inductance, "mutual_inductance": mutual_inductance,
            "loop_inductance": loop_inductance, "R_single": R_single, "R_total": R_total, "Q": Q}


class Api(QObject):

    def __init__(self, ):
        super().__init__()
        self.occ_api = Occ_api()

    @pyqtSlot(str, list, int, list, float, list, result="QVariant")
    def generateOCCWireModule(self, name, points, wireAmount, wireGap, radius, weldMetalShape):
        for idx, point in enumerate(points):
            points[idx] = list(map(lambda value: value / 1e3, point))
        wireGap = list(map(lambda value: value / 1e3, wireGap))
        radius /= 1e3
        weldMetalShape = list(map(lambda value: value / 1e3, weldMetalShape))
        newPoints = self.occ_api.generateWire(name, points, wireAmount, wireGap, radius, weldMetalShape)
        for idx, point in enumerate(newPoints):
            newPoints[idx] = list(map(lambda value: value * 1e3, point))
        return QVariant(newPoints)

    @pyqtSlot(str, list, float, float, float)
    def generateMetalGasket(self, name, position, dx, dy, dz):
        position = list(map(lambda value: value / 1e3, position))
        dx /= 1e3
        dy /= 1e3
        dz /= 1e3
        metalGasket = self.occ_api.makeCuboid([position[0], position[1], position[2]],
                                              dx, dy, dz)
        self.occ_api.metalGasket[name] = metalGasket

    @pyqtSlot(str, list, float, float, float)
    def generateMosCapacitance(self, name, position, dx, dy, dz):
        position = list(map(lambda value: value / 1e3, position))
        dx /= 1e3
        dy /= 1e3
        dz /= 1e3
        mosCapacitance = self.occ_api.makeCuboid(
            [position[0], position[1], position[2]], dx, dy, dz)
        self.occ_api.mosCapacitance[name] = mosCapacitance

    @pyqtSlot(float, float, float, float, list)
    def generateOCCTubeModule(self, thickness, dx_inner, dy_inner, dz_inner, position, nameID="tube"):
        thickness /= 1e3
        dx_inner /= 1e3
        dy_inner /= 1e3
        dz_inner /= 1e3
        position = list(map(lambda value: value / 1e3, position))
        self.occ_api.generateTube(thickness, dx_inner, dy_inner, dz_inner, position, nameID)

    @pyqtSlot(list, float, float, str)
    def generateFins(self, points, width, height, nameID):
        for idx, point in enumerate(points):
            points[idx] = list(map(lambda value: value / 1e3, point))
        width /= 1e3
        height /= 1e3
        self.occ_api.makeFins(points, width, height, nameID)

    @pyqtSlot(list, float, float, float, str)
    def generatePins(self, position, dx, dy, dz, nameID):
        position = list(map(lambda value: value / 1e3, position))
        dx /= 1e3
        dy /= 1e3
        dz /= 1e3
        shape = self.occ_api.makeCuboid(position, dx, dy, dz)
        self.occ_api.pins[nameID] = shape

    @pyqtSlot(int, int, float, float, list, list, float, float, float, result="QVariant")
    def calc_output_single_from_three_points(self, wireAmount, idx, conductivity, frequency, points, wireGaps,
                                             wireRadius, permittivity, lossTangent):
        point1, point2, point3 = points
        point1X, point1Y, point1Z = point1
        point2X, point2Y, point2Z = point2
        point3X, point3Y, point3Z = point3
        x1 = y1 = 0
        x2 = math.sqrt(
            (point2X - point1X) ** 2 + (point2Z - point1Z) ** 2) if point2X - point1X >= 0 else -math.sqrt(
            (point2X - point1X) ** 2 + (point2Z - point1Z) ** 2)
        y2 = point2Y - point1Y
        x3 = math.sqrt(
            (point3X - point1X) ** 2 + (point3Z - point1Z) ** 2) if point3X - point1X >= 0 else -math.sqrt(
            (point3X - point1X) ** 2 + (point3Z - point1Z) ** 2)
        y3 = point3Y - point1Y
        X = [x1, x2, x3]
        Y = [y1, y2, y3]
        return QVariant(
            calc_from_three_points(wireAmount, idx, conductivity, frequency, X, Y, wireGaps,
                                   wireRadius, permittivity, lossTangent))

    @pyqtSlot(int, int, float, float, list, list, float, float, float, result="QVariant")
    def calc_output_single_from_five_points(self, wireAmount, idx, conductivity, frequency, points, wireGaps,
                                            wireRadius, permittivity, lossTangent):
        point1, point2, point3, point4, point5 = points
        point1X, point1Y, point1Z = point1
        point2X, point2Y, point2Z = point2
        point3X, point3Y, point3Z = point3
        point4X, point4Y, point4Z = point4
        point5X, point5Y, point5Z = point5
        x1 = y1 = 0
        x2 = math.sqrt(
            (point2X - point1X) ** 2 + (point2Z - point1Z) ** 2) if point2X - point1X >= 0 else -math.sqrt(
            (point2X - point1X) ** 2 + (point2Z - point1Z) ** 2)
        y2 = point2Y - point1Y
        x3 = math.sqrt(
            (point3X - point1X) ** 2 + (point3Z - point1Z) ** 2) if point3X - point1X >= 0 else -math.sqrt(
            (point3X - point1X) ** 2 + (point3Z - point1Z) ** 2)
        y3 = point3Y - point1Y
        x4 = math.sqrt(
            (point4X - point1X) ** 2 + (point4Z - point1Z) ** 2) if point4X - point1X >= 0 else -math.sqrt(
            (point4X - point1X) ** 2 + (point4Z - point1Z) ** 2)
        y4 = point4Y - point1Y
        x5 = math.sqrt(
            (point5X - point1X) ** 2 + (point5Z - point1Z) ** 2) if point5X - point1X >= 0 else -math.sqrt(
            (point5X - point1X) ** 2 + (point5Z - point1Z) ** 2)
        y5 = point5Y - point1Y
        X = [x1, x2, x3, x4, x5]
        Y = [y1, y2, y3, y4, y5]
        return QVariant(
            calc_from_five_points(wireAmount, idx, conductivity, frequency, X, Y, wireGaps,
                                  wireRadius, permittivity, lossTangent))

    @pyqtSlot(int, int, list, list, list, list, float, float, result="QVariant")
    def calc_mutual_inductance_between_groups(self, wireAmount1, wireAmount2, points1, points2, wireGaps1,
                                              wireGaps2,
                                              wireRadius1, wireRadius2):
        X1 = []
        Y1 = []
        X2 = []
        Y2 = []
        for point in points1:
            X1.append(point[0])
            Y1.append(point[1])
        for point in points2:
            X2.append(point[0])
            Y2.append(point[1])
        wireGap1 = sum(wireGaps1) / len(wireGaps1)
        wireGap2 = sum(wireGaps2) / len(wireGaps2)
        x_offset = math.fabs((X1[0] + X1[len(X1) - 1]) / 2 - (X2[0] + X2[len(X2) - 1]) / 2)
        z_offset = math.fabs(points1[0][2] - points2[0][2])
        X1 = np.array([X1])
        X2 = np.array([X2])
        Y1 = np.array([Y1])
        Y2 = np.array([Y2])
        mutual_inductance_total = []
        for n in range(wireAmount1):
            M_q = 0
            for k in range(wireAmount2):
                f1_1 = lambda x, y: (1 + (Y1[0, int(Y1.shape[1] / 2)] - Y1[0, 0]) /
                                     (X1[0, int(X1.shape[1] / 2)] - X1[0, 0]) *
                                     (Y2[0, int(Y2.shape[1] / 2)] - Y2[0, 0]) /
                                     (X2[0, int(X2.shape[1] / 2)] - X2[0, 0])) / math.sqrt(
                    (x - y + x_offset) ** 2 + (
                            (Y1[0, int(Y1.shape[1] / 2)] - Y1[0, 0]) / (
                            X1[0, int(X1.shape[1] / 2)] - X1[0, 0]) * x -
                            (Y2[0, int(Y2.shape[1] / 2)] - Y2[0, 0]) / (
                                    X2[0, int(X2.shape[1] / 2)] - X2[0, 0]) * y) ** 2 +
                    (n * wireGap1 + z_offset + k * wireGap2 + wireRadius1 / 2 + wireRadius2 / 2) ** 2)
                f1_2 = lambda x, y: (1 + (Y1[0, -1] - Y1[0, int(Y1.shape[1] / 2)]) / (
                        X1[0, -1] - X1[0, int(X1.shape[1] / 2)]) * (Y2[0, -1] - Y2[0, int(Y2.shape[1] / 2)]) / (
                                             X2[0, -1] - X2[0, int(X2.shape[1] / 2)])) / math.sqrt(
                    (x - y + x_offset) ** 2 + ((Y1[0, -1] - Y1[0, int(Y1.shape[1] / 2)]) / (
                            X1[0, -1] - X1[0, int(X1.shape[1] / 2)]) * x - (
                                                       Y2[0, -1] - Y2[0, int(Y2.shape[1] / 2)]) / (
                                                       X2[0, -1] - X2[0, int(X2.shape[1] / 2)]) * y) ** 2 + (
                            n * wireGap1 + z_offset + k * wireGap2 + wireRadius1 / 2 + wireRadius2 / 2) ** 2)
                Q1_1 = integrate.dblquad(f1_1, 0, X1[0, int(X1.shape[1] / 2)], 0,
                                         X2[0, int(X2.shape[1] / 2)] + x_offset)[0] * 100
                Q1_2 = integrate.dblquad(f1_2, 0, X1[0, -1] - X1[0, int(X1.shape[1] / 2)], 0,
                                         X2[0, -1] - X2[0, int(X2.shape[1] / 2)] + x_offset)[0] * 100
                M_q += Q1_1 + Q1_2
            mutual_inductance_total.append(M_q)
        return QVariant(sum(mutual_inductance_total) * 1e-6)

    @pyqtSlot(str)
    def popWire(self, name):
        self.occ_api.wire.pop(name, None)
        self.occ_api.weldMetal.pop(name, None)

    @pyqtSlot(str)
    def popMetalGasket(self, name):
        self.occ_api.metalGasket.pop(name)

    @pyqtSlot(str)
    def popMosCapacitance(self, name):
        self.occ_api.mosCapacitance.pop(name)

    @pyqtSlot()
    def popTube(self, name="tube"):
        self.occ_api.tube.pop(name)

    @pyqtSlot(str)
    def popFins(self, name):
        self.occ_api.fins.pop(name)

    @pyqtSlot(str)
    def popPins(self, name):
        self.occ_api.pins.pop(name)

    @pyqtSlot(list, list, list, str, str)
    def saveOCCModule_WirePart(self, wireNameIDList, metalGasketNameIDList, mosCapacitanceNameIDList, path, suffix):
        shapeList = []
        if suffix == "step" or suffix == "iges" or "stp" or "igs":
            wireShape = None
            weldMetalShape = None
            metalGasketShape = None
            mosCapacitanceShape = None
            if len(wireNameIDList) != 0:
                wireShapeList = []
                weldMetalShapeList = []
                for wireNameID in wireNameIDList:
                    wireShapeList.append(self.occ_api.wire[wireNameID])
                    weldMetalShapeList.append(self.occ_api.weldMetal[wireNameID])
                wireShape = reduce(self.occ_api.fuseShape, wireShapeList)
                weldMetalShape = reduce(self.occ_api.fuseShape, weldMetalShapeList)
            if len(metalGasketNameIDList) != 0:
                metalGasketShapeList = []
                for metalGasketNameID in metalGasketNameIDList:
                    metalGasketShapeList.append(self.occ_api.metalGasket[metalGasketNameID])
                metalGasketShape = reduce(self.occ_api.fuseShape, metalGasketShapeList)
            if len(mosCapacitanceNameIDList) != 0:
                mosCapacitanceShapeList = []
                for mosCapacitanceNameID in mosCapacitanceNameIDList:
                    mosCapacitanceShapeList.append(self.occ_api.mosCapacitance[mosCapacitanceNameID])
                mosCapacitanceShape = reduce(self.occ_api.fuseShape, mosCapacitanceShapeList)
            for shape in [wireShape, weldMetalShape, metalGasketShape, mosCapacitanceShape]:
                if shape is not None:
                    shapeList.append(shape)
        if suffix == "step" or suffix == "stp":
            self.occ_api.saveAsStep(shapeList, path)
        if suffix == "iges" or suffix == "igs":
            self.occ_api.saveAsIGES(shapeList, path)

    @pyqtSlot(list, list, list, str, str)
    def saveOCCModule_TubePart(self, tubeNameIDList, finsNameIDList, pinsNameIDList, path, suffix):
        shapeList = []
        if suffix == "step" or suffix == "iges" or "stp" or "igs":
            tubeShape = None
            finsShape = None
            pinsShape = None
            if len(tubeNameIDList) != 0:
                tubeShapeList = []
                for tubeNameID in tubeNameIDList:
                    tubeShapeList.append(self.occ_api.tube[tubeNameID])
                tubeShape = reduce(self.occ_api.fuseShape, tubeShapeList)
            if len(finsNameIDList) != 0:
                finShapeList = []
                for finsNameID in finsNameIDList:
                    finShapeList.append(self.occ_api.fins[finsNameID])
                finsShape = reduce(self.occ_api.fuseShape, finShapeList)
            if len(pinsNameIDList) != 0:
                pinsShapeList = []
                for pinsNameID in pinsNameIDList:
                    pinsShapeList.append(self.occ_api.pins[pinsNameID])
                pinsShape = reduce(self.occ_api.fuseShape, pinsShapeList)
            for shape in [tubeShape, finsShape, pinsShape]:
                if shape is not None:
                    shapeList.append(shape)
        if suffix == "step" or suffix == "stp":
            self.occ_api.saveAsStep(shapeList, path)
        if suffix == "iges" or suffix == "igs":
            self.occ_api.saveAsIGES(shapeList, path)

    @pyqtSlot(str)
    def saveAllOCCModule(self, path):
        shapeList = list(self.occ_api.tube.values()) + list(self.occ_api.wire.values()) + list(
            self.occ_api.weldMetal.values()) + list(self.occ_api.mosCapacitance.values()) + list(
            self.occ_api.metalGasket.values()) + list(self.occ_api.fins.values()) + list(self.occ_api.pins.values())
        self.occ_api.saveAsStep(shapeList, path)

    # for test
    def show(self):
        self.occ_api.display()


if __name__ == "__main__":
    print(calc_from_three_points(5, 0, 3.8e7, 3, [0, 100, 200], [200, 150, 0], [100, 100, 100, 100], 10,
                                 3, 0.02))
    pass
