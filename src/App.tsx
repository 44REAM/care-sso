import React, { useState, useEffect } from "react";
import "./App.css";

// Define TypeScript interfaces for our data structures
interface YearData {
	C: number;
	M: number;
	i: number | null;
	compensate: number;
}

interface StaticDataType {
	[year: string]: YearData;
}

interface MoneyDataType {
	[year: string]: number;
}

interface MonthDataType {
	[year: string]: number;
}

// Changed from string to number
interface RateDataType {
	[year: string]: number;
}

interface CompensateDataType {
	[year: string]: number;
}

interface CalculationResult {
	ReValue33: { [year: string]: number };
	AdjustedAmount33: { [year: string]: number };
	m39Values: { [year: string]: number };
	discountFactors: { [year: string]: number };
	cumMonths33: { [year: string]: number };
	cumMonths39: { [year: string]: number };
	totalCumMonths: { [year: string]: number };
	combinedAdjustedAmount: { [year: string]: number };
	finalCombinedAmount: number;
	pensionPercentage: number;
	pensionAmount: number;
	oldPensionAmount: number;
	compensatedPension: number;
	years: string[];
}


const staticData: StaticDataType = {
	"2541": { C: 16250, M: 15000, i: 1, compensate: 100 },
	"2542": { C: 16250, M: 15000, i: 1.019122519, compensate: 100 },
	"2543": { C: 16250, M: 15000, i: 1, compensate: 100 },
	"2544": { C: 16250, M: 15000, i: 1.011890167, compensate: 100 },
	"2545": { C: 16250, M: 15000, i: 1.002681959, compensate: 100 },
	"2546": { C: 16250, M: 15000, i: 1.003685355, compensate: 100 },
	"2547": { C: 16250, M: 15000, i: 1.01863354, compensate: 100 },
	"2548": { C: 16250, M: 15000, i: 1.033536585, compensate: 100 },
	"2549": { C: 16250, M: 15000, i: 1.050147493, compensate: 100 },
	"2550": { C: 16250, M: 15000, i: 1.030898876, compensate: 100 },
	"2551": { C: 16250, M: 15000, i: 1.035422343, compensate: 100 },
	"2552": { C: 16250, M: 15000, i: 1.039473684, compensate: 100 },
	"2553": { C: 16250, M: 15000, i: 1.016455696, compensate: 100 },
	"2554": { C: 16250, M: 15000, i: 1.02117061, compensate: 100 },
	"2555": { C: 16250, M: 15000, i: 1.159756098, compensate: 100 },
	"2556": { C: 16250, M: 15000, i: 1.069821241, compensate: 100 },
	"2557": { C: 16250, M: 15000, i: 1.030076666, compensate: 100 },
	"2558": { C: 16250, M: 15000, i: 1.020038168, compensate: 100 },
	"2559": { C: 16250, M: 15000, i: 1.01777362, compensate: 100 },
	"2560": { C: 16250, M: 15000, i: 1.018382353, compensate: 100 },
	"2561": { C: 16250, M: 15000, i: 1.013537906, compensate: 100 },
	"2562": { C: 16250, M: 15000, i: 1.011576135, compensate: 100 },
	"2563": { C: 16250, M: 15000, i: 1.013204225, compensate: 100 },
	"2564": { C: 16250, M: 15000, i: 1.007819288, compensate: 100 },
	"2565": { C: 16250, M: 15000, i: 1.007758621, compensate: 100 },
	"2566": { C: 16250, M: 15000, i: 1.020530368, compensate: 100 },
	"2567": { C: 16250, M: 15000, i: 1.015088013, compensate: 100 },
	"2568": { C: 16250, M: 15000, i: null, compensate: 100 },
	"2569": { C: 17500, M: 17500, i: null, compensate: 100 },
	"2570": { C: 17500, M: 17500, i: null, compensate: 80 },
	"2571": { C: 17500, M: 17500, i: null, compensate: 60 },
	"2572": { C: 20000, M: 20000, i: null, compensate: 40 },
	"2573": { C: 20000, M: 20000, i: null, compensate: 20 },
	"2574": { C: 20000, M: 20000, i: null, compensate: 0 },
	"2575": { C: 23000, M: 23000, i: null, compensate: 0 },
	"2576": { C: 23000, M: 23000, i: null, compensate: 0 },
	"2577": { C: 23000, M: 23000, i: null, compensate: 0 },
	"2578": { C: 23000, M: 23000, i: null, compensate: 0 },
	"2579": { C: 23000, M: 23000, i: null, compensate: 0 },
	"2580": { C: 23000, M: 23000, i: null, compensate: 0 },
};

const getYearArray = (start: number, end: number): string[] => {
	const years: string[] = [];
	for (let y = Math.min(Math.max(start, 2541), Math.max(end, 2541)); y <= Math.max(Math.min(end, 2580), Math.min(start, 2580)); y++) {
		years.push(String(y));
	}
	return years;
};

const computeDiscountFactor = (year: number, dataOverride: { [key: string]: YearData }): number => {
	if (year < 2543) return 1;
	let pureRevaluedAvg = 1;
	for (let k = Math.max(year - 4, 2541); k < year; k++) {
		if (dataOverride[k]?.i !== null) {
			pureRevaluedAvg *= dataOverride[k].i as number;
		}
	}
	let sum = 1;
	let count = 0;
	for (let j = Math.max(year - 4, 2541); j < year; j++) {
		let prod = 1;
		for (let k = Math.max(year - 4, 2541); k <= j; k++) {
			if (dataOverride[k]?.i !== null) {
				prod *= dataOverride[k].i as number;
			}
		}
		sum += prod;
		count += 1;
	}
	const oldNominalAvg = sum / (count + 1);
	return pureRevaluedAvg / oldNominalAvg;
};

// Calculate ceiling value for M39 based on the year
const calculateM39Ceiling = (year: string, dataOverride: { [key: string]: YearData }): number => {
	const baseValue = 4800;

	if (parseInt(year) <= 2569) {
		return baseValue;
	}

	// Calculate the dynamic ceiling value for years after 2569
	let ceiling = baseValue;
	for (let y = 2570; y <= parseInt(year); y++) {
		const prevYear = String(y - 1);
		if (dataOverride[prevYear]?.i !== null) {
			ceiling = ceiling * (dataOverride[prevYear].i as number);
		}
	}

	return ceiling;
};

const calculateCARE = (
	startYear: number,
	endYear: number,
	moneyData: MoneyDataType,
	month33Data: MonthDataType,
	month39Data: MonthDataType,
	rateData: RateDataType,
	conpensate: CompensateDataType
): CalculationResult => {
	const years = getYearArray(startYear, endYear);
	const n = years.length;
	const ReValue33: { [key: string]: number } = {};
	const AdjustedAmount33: { [key: string]: number } = {};
	const m39Values: { [key: string]: number } = {};
	const cumMonths33: { [key: string]: number } = {};
	const cumMonths39: { [key: string]: number } = {};
	const totalCumMonths: { [key: string]: number } = {};
	const discountFactors: { [key: string]: number } = {};
	const combinedAdjustedAmount: { [key: string]: number } = {};

	const dataOverride: { [key: string]: YearData } = {};
	Object.keys(staticData).forEach((yr) => {
		if (parseInt(yr) > endYear) return;
		if (!staticData[yr]) {
			throw new Error(`ไม่มีข้อมูลสำหรับปี ${yr}`);
		}
		let iVal = staticData[yr].i;
		if (iVal === null || parseInt(yr) >= 2568) {
			if (rateData[yr] === undefined || isNaN(rateData[yr])) {
				throw new Error(`กรุณากรอกค่า i สำหรับปี ${yr}`);
			}
			iVal = rateData[yr];
			if (isNaN(iVal)) {
				throw new Error(`ค่า i สำหรับปี ${yr} ไม่ถูกต้อง`);
			}
			if (iVal < 1) {
				throw new Error(`ค่า i สำหรับปี ${yr} ต้องมีค่าตั้งแต่ 1 ขึ้นไป`);
			}
		}
		dataOverride[yr] = { ...staticData[yr], i: iVal };
	});

	let previousReValue33 = 0;
	let previousAdjustedAmount33 = 0;
	let previousCumMonths33 = 0;
	let previousCumMonths39 = 0;

	// First pass to calculate M33 values
	for (let idx = 0; idx < n; idx++) {
		const yr = years[idx];
		const data = dataOverride[yr];
		const P = moneyData[yr];
		const w33 = month33Data[yr];
		const w39 = month39Data[yr];
		const currentC = data.C;
		const currentM = data.M;

		const W33_prev = previousCumMonths33;
		const W33_current = previousCumMonths33 + w33;
		const W39_current = previousCumMonths39 + w39;

		cumMonths33[yr] = W33_current;
		cumMonths39[yr] = W39_current;
		totalCumMonths[yr] = W33_current + W39_current;

		// Calculate M33 ReValue
		let currentReValue33: number;
		if (idx === 0 || W33_prev === 0) {
			currentReValue33 = P;
		} else {
			const prevYear = years[idx - 1];
			const i_prev = dataOverride[prevYear].i as number;
			const corrected_i_prev = i_prev < 1 ? 1 : i_prev;
			const candidate = previousReValue33 * corrected_i_prev;
			const cappedCandidate = Math.min(candidate, currentC);
			currentReValue33 = (W33_prev > 0) ? (cappedCandidate * W33_prev + P * w33) / W33_current : P;
		}

		ReValue33[yr] = currentReValue33;

		const discountFactor = computeDiscountFactor(parseInt(yr), dataOverride);
		discountFactors[yr] = discountFactor;

		const part1 = Math.min(currentReValue33 / discountFactor, currentM);
		let part2 = currentReValue33;
		if (idx > 0 && W33_prev > 0) {
			part2 = Math.min(previousAdjustedAmount33, currentReValue33);
		}
		const currentAdjustedAmount33 = Math.max(part1, part2);
		AdjustedAmount33[yr] = currentAdjustedAmount33;

		// Calculate M39 value for this year
		const m39Ceiling = calculateM39Ceiling(yr, dataOverride);
		m39Values[yr] = m39Ceiling;

		// Calculate the weighted average for combined adjusted amount
		const totalMonths = totalCumMonths[yr];
		if (totalMonths > 0) {
			combinedAdjustedAmount[yr] = (cumMonths33[yr] * currentAdjustedAmount33 + cumMonths39[yr] * m39Ceiling) / totalMonths;
		} else {
			combinedAdjustedAmount[yr] = 0;
		}

		previousReValue33 = currentReValue33;
		previousAdjustedAmount33 = currentAdjustedAmount33;
		previousCumMonths33 = W33_current;
		previousCumMonths39 = W39_current;
	}

	const T = years[n - 1];
	const finalCombinedAmount = combinedAdjustedAmount[T];
	const totalMonths = totalCumMonths[T];
	let pensionPercentage = 0;

	if (totalMonths <= 180) {
		pensionPercentage = 0.20;
	} else {
		pensionPercentage = 0.20 + 0.00125 * (totalMonths - 180);
	}
	const pensionAmount = pensionPercentage * finalCombinedAmount;

	const oldFinalCombinedAmount = calculateOldFormula(startYear, endYear, moneyData, month33Data, month39Data, dataOverride);
	const oldPensionAmount = pensionPercentage * oldFinalCombinedAmount;
	const compensatedPension = pensionAmount + Math.max(oldPensionAmount - pensionAmount, 0) * conpensate[T] / 100

	console.log(compensatedPension);

	return {
		ReValue33,
		AdjustedAmount33,
		m39Values,
		discountFactors,
		cumMonths33,
		cumMonths39,
		totalCumMonths,
		combinedAdjustedAmount,
		finalCombinedAmount,
		pensionPercentage,
		pensionAmount,
		oldPensionAmount,
		compensatedPension,
		years,
	};
};

const calculateOldFormula = (
	startYear: number,
	endYear: number,
	moneyData: MoneyDataType,
	month33Data: MonthDataType,
	month39Data: MonthDataType,
	dataOverride: { [key: string]: YearData }
): number => {

	const oldMonth: number[] = [];
	const avgMoney: number[] = [];
	let totalMonth = 0;
	let year = endYear;

	while (totalMonth < 60) {
		// Convert year to string since our objects are indexed by string keys
		const yearKey = year.toString();

		// Get the values or assume 0 if not available
		const value33 = month33Data[yearKey] || 0;
		const value39 = month39Data[yearKey] || 0;
		const sumForYear = value33 + value39;

		const money39 = calculateM39Ceiling(yearKey, dataOverride);
		const money33 = moneyData[yearKey] || 0;
		if (sumForYear > 0) {
			avgMoney.push((value33 * money33 + value39 * money39) / sumForYear)
		} else {
			avgMoney.push(0)
		}

		// Add the values to the running total and store the year in the list.
		totalMonth += sumForYear;
		if (totalMonth >= 60) {
			oldMonth.push(totalMonth - 60);
		} else {
			oldMonth.push(sumForYear);
		}
		// Move to the previous year
		year--;
		// Stop if year becomes negative (or some reasonable lower bound if needed)
		if (year < startYear) {
			break;
		}
	}
	if (oldMonth.length !== avgMoney.length) {
		throw new Error("Arrays must be of the same length");
	}
	let weightedSum = 0;
	let weightTotal = 0;

	for (let i = 0; i < oldMonth.length; i++) {
		weightedSum += avgMoney[i] * oldMonth[i];
		weightTotal += oldMonth[i];
	}
	return weightTotal !== 0 ? weightedSum / weightTotal : 0;



}

function formatNumber(num: number): string {
	return num.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
}


const CAREPensionCalculator: React.FC = () => {
	const [startYear, setStartYear] = useState<number>(2541);
	const [endYear, setEndYear] = useState<number>(2569);
	const [moneyData, setMoneyData] = useState<MoneyDataType>({});
	const [month33Data, setMonth33Data] = useState<MonthDataType>({});
	const [month39Data, setMonth39Data] = useState<MonthDataType>({});
	const [rateData, setRateData] = useState<RateDataType>({});
	const [conpensate, setCompensate] = useState<CompensateDataType>({});
	const [result, setResult] = useState<CalculationResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isInitialized, setIsInitialized] = useState<boolean>(false);
	const [showDetails, setShowDetails] = useState<boolean>(false);
	const [showIndexSection, setShowIndexSection] = useState(false);

	const toggleIndexSection = () => {
		setShowIndexSection((prev) => !prev);
	};


	// Validate that the total months (m33 + m39) don't exceed 12
	const validateMonthsTotal = (yr: string, m33Value: number, m39Value: number): boolean => {
		const total = parseFloat(m33Value.toString()) + parseFloat(m39Value.toString());
		if (total > 12) {
			setError(`จำนวนเดือนรวม (ม.33 + ม.39) สำหรับปี ${yr} ต้องไม่เกิน 12 เดือน`);
			return false;
		}
		setError(null);
		return true;
	};

	// Handle month33 data changes with validation
	const handleMonth33Change = (yr: string, value: string): void => {
		const m33Value = parseInt(value, 10);
		const m39Value = month39Data[yr] || 0;

		if (validateMonthsTotal(yr, m33Value, m39Value)) {
			setMonth33Data({
				...month33Data,
				[yr]: m33Value,
			});
		}
		if (m33Value === 0) {
			setMoneyData({
				...moneyData,
				[yr]: 0,
			})
		} else if (m33Value > 0 && moneyData[yr] <= 0) {
			setMoneyData({
				...moneyData,
				[yr]: 1650,
			})
		}
	};

	// Handle month39 data changes with validation
	const handleMonth39Change = (yr: string, value: string): void => {
		const m39Value = parseFloat(value);
		const m33Value = month33Data[yr] || 0;

		if (validateMonthsTotal(yr, m33Value, m39Value)) {
			setMonth39Data({
				...month39Data,
				[yr]: m39Value,
			});
		}
	};

	// Handle rate data input with validation - Modified to store as number
	const handleRateDataChange = (yr: string, value: string): void => {
		let floatValue = parseFloat(value);

		// If the value is not a valid number, default to 1
		if (isNaN(floatValue)) {
			floatValue = 1;
		}
		// Don't allow values less than 1
		else if (floatValue < 1) {
			floatValue = 1;
		}

		setRateData({
			...rateData,
			[yr]: floatValue
		});
	};

	const handleRCompensateDataChange = (yr: string, value: string): void => {
		let floatValue = parseFloat(value);

		// If the value is not a valid number, default to 1
		if (isNaN(floatValue)) {
			floatValue = 1;
		}
		// Don't allow values less than 1
		else if (floatValue < 1) {
			floatValue = 1;
		}

		setCompensate({
			...conpensate,
			[yr]: floatValue
		});
	};

	// Initialize data for the years range
	const initializeYearData = (start: number, end: number): void => {
		const years = getYearArray(start, end);
		setMoneyData((prev) => {
			const newData: MoneyDataType = {};
			years.forEach((yr) => {
				newData[yr] = prev[yr] !== undefined ? prev[yr] : 15000;
			});
			return newData;
		});
		setMonth33Data((prev) => {
			const newData: MonthDataType = {};
			years.forEach((yr) => {
				newData[yr] = prev[yr] !== undefined ? prev[yr] : 12;
			});
			return newData;
		});
		setMonth39Data((prev) => {
			const newData: MonthDataType = {};
			years.forEach((yr) => {
				newData[yr] = prev[yr] !== undefined ? prev[yr] : 0;
			});
			return newData;
		});
		setRateData((prev) => {
			const newData: RateDataType = {};
			years.forEach((yr) => {
				if (staticData[yr] && (staticData[yr].i === null || parseInt(yr) >= 2568)) {
					newData[yr] = prev[yr] !== undefined ? prev[yr] : 1.03;
				} else if (staticData[yr]) {
					newData[yr] = prev[yr] !== undefined ? prev[yr] : (staticData[yr].i as number);
				}
			});
			return newData;
		});
		setCompensate((prev) => {
			const newData: CompensateDataType = {};
			years.forEach((yr) => {
				if (staticData[yr]) {
					newData[yr] = prev[yr] !== undefined ? prev[yr] : (staticData[yr].compensate as number);
				}
			});
			return newData;
		});
		setIsInitialized(true);
	};

	// Initial setup (only once)
	useEffect(() => {
		initializeYearData(2541, 2580);
	}, []);

	const handleCalculation = (): void => {
		setError(null);

		try {
			const years = getYearArray(startYear, endYear);
			if (startYear < 2541) {
				throw new Error("ปีเริ่มต้นต้องไม่น้อยกว่า 2541");
			}
			if (endYear > 2580) {
				throw new Error("ปีสุดท้ายต้องไม่เกิน 2580");
			}
			for (const yr of years) {
				if (isNaN(moneyData[yr])) {
					throw new Error(`ค่าเงินค่าจ้างไม่ถูกต้องสำหรับปี ${yr}`);
				}

				const m33Value = month33Data[yr] || 0;
				const m39Value = month39Data[yr] || 0;

				if (isNaN(m33Value) || m33Value < 0) {
					throw new Error(`จำนวนเดือน ม.33 ไม่ถูกต้องสำหรับปี ${yr}`);
				}

				if (isNaN(m39Value) || m39Value < 0) {
					throw new Error(`จำนวนเดือน ม.39 ไม่ถูกต้องสำหรับปี ${yr}`);
				}

				if (m33Value + m39Value > 12) {
					throw new Error(`จำนวนเดือนรวม (ม.33 + ม.39) สำหรับปี ${yr} ต้องไม่เกิน 12 เดือน`);
				}

				if ((m33Value + m39Value <= 0) && moneyData[yr] > 0) {
					throw new Error(`จำนวนเดือนรวม (ม.33 + ม.39) สำหรับปี ${yr} ต้องมากกว่า 0`);
				}
				if ((m33Value > 0) && moneyData[yr] <= 0) {
					throw new Error(`ค่าเงินค่าจ้างไม่ถูกต้องสำหรับปี ${yr} เงินค่าจ้างต้องมากกว่า 1650 บาท`);
				}

				if (parseInt(yr) >= 2568) {
					if (isNaN(rateData[yr]) || rateData[yr] <= 0) {
						throw new Error(`ค่า i ไม่ถูกต้องสำหรับปี ${yr}`);
					}
					if (rateData[yr] < 1) {
						throw new Error(`ค่า i สำหรับปี ${yr} ต้องมีค่าตั้งแต่ 1 ขึ้นไป`);
					}
				}
			}
			const calcResult = calculateCARE(startYear, endYear, moneyData, month33Data, month39Data, rateData, conpensate);
			setResult(calcResult);
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message || "Error during calculation");
			} else {
				setError("Unknown error occurred during calculation");
			}
			setResult(null);
		}
	};

	if (!isInitialized) {
		return <div>Loading...</div>;
	}

	return (
		<div className="bg-gray-50 p-6 rounded-lg shadow-md max-w-5xl mx-auto">
			<h1 className="text-2xl font-bold text-center mb-6 text-blue-700">การคำนวณค่าบำนาญสูตร CARE</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
				<div>
					<label className="block text-gray-700 mb-2">
						ปีทีี่เริ่มส่งเงินสมทบ (เช่น 2541):
						<div className="flex mt-1">
							<input
								type="number"
								className="w-full p-2 border rounded-l"
								value={startYear}
								onChange={(e) => setStartYear(parseInt(e.target.value))}
								onBlur={(e) => {
									const inputValue = e.target.value;
									const parsedValue = parseInt(inputValue);
									if (!isNaN(parsedValue) && parsedValue >= 2541 && parsedValue <= 2580) {
										setStartYear(parsedValue);
									} else {
										setStartYear(2541); // or some default or error handling
									}
								}}
								min={2541}
								max={2580}
							/>
						</div>
					</label>
				</div>
				<div>
					<label className="block text-gray-700 mb-2">
						ปีที่เกิดสิทธิรับบำนาญ (เช่น 2556):
						<div className="flex mt-1">
							<input
								type="number"
								className="w-full p-2 border rounded-l"
								value={endYear}
								onChange={(e) => setEndYear(parseInt(e.target.value))}
								onBlur={(e) => {
									const inputValue = e.target.value;
									const parsedValue = parseInt(inputValue);
									if (!isNaN(parsedValue) && parsedValue >= 2541 && parsedValue <= 2580) {
										setEndYear(parsedValue);
									} else {
										setEndYear(2580); // or some default or error handling
									}
								}}
								min={2541}
								max={2580}
							/>
						</div>
					</label>
				</div>
			</div>

			<div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
				<h2 className="text-xl font-semibold mb-3">กรอกข้อมูลประจำปี</h2>
				<div className="overflow-x-auto">
					<table className="w-full border-collapse border border-gray-300 text-sm">
						<thead className="bg-gray-100">
							<tr>
								<th className="p-2 border">ปี พ.ศ.</th>
								<th className="p-2 border">ค่าจ้างเฉลี่ย P[t]</th>
								<th className="p-2 border">เดือนที่ส่ง ม33 w33[t]</th>
								<th className="p-2 border">เดือนที่ส่ง ม39 w39[t]</th>
								<th className="p-2 border">เพดานค่าจ้าง M(t)</th>
								{/* Remove index column from main table */}
							</tr>
						</thead>
						<tbody>
							{getYearArray(startYear, endYear).map((yr) => (
								<tr key={yr} className="hover:bg-gray-50">
									<td className="p-2 border text-center">{yr}</td>

									<td className="p-2 border text-right">
										<input
											type="number"
											className="w-full p-1 border rounded"
											value={(moneyData[yr] || 0).toString()}
											onChange={(e) =>
												setMoneyData({
													...moneyData,
													[yr]: parseFloat(e.target.value),
												})
											}
											onBlur={(e) => {
												const inputValue = e.target.value;
												const parsedValue = parseFloat(inputValue);
												if (
													!isNaN(parsedValue) &&
													parsedValue >= 1650 &&
													parsedValue <= staticData[yr].M
												) {
													setMoneyData({
														...moneyData,
														[yr]: parseFloat(e.target.value),
													});
												} else if (month33Data[yr] === 0) {
													setMoneyData({
														...moneyData,
														[yr]: 0,
													});
												} else if (parsedValue < 1650) {
													setMoneyData({
														...moneyData,
														[yr]: 1650,
													});
												} else {
													setMoneyData({
														...moneyData,
														[yr]: staticData[yr].M,
													});
												}
											}}
											min="1650"
											step="1"
											inputMode="numeric"
											placeholder="กรอกค่าจ้างเฉลี่ย P[t]"
											style={{ minWidth: '100px' }}
										/>
									</td>
									<td className="p-2 border">
										<input
											type="number"
											className="w-full p-1 border rounded"
											value={(month33Data[yr] || 0).toString()}
											onChange={(e) => handleMonth33Change(yr, e.target.value)}
											min="0"
											max="12"
											step="1"
											inputMode="numeric"
											style={{ minWidth: '50px' }}
										/>
									</td>
									<td className="p-2 border">
										<input
											type="number"
											className="w-full p-1 border rounded"
											value={(month39Data[yr] || 0).toString()}
											onChange={(e) => handleMonth39Change(yr, e.target.value)}
											min="0"
											max="12"
											step="1"
											inputMode="numeric"
											style={{ minWidth: '50px' }}
										/>
									</td>
									<td className="p-2 border text-center">{staticData[yr].M}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
			<button
				className="text-blue-600 hover:text-blue-800 font-medium mb-2 flex items-center"
				onClick={toggleIndexSection}
			>
				{showIndexSection ? 'ซ่อนข้อมูล Index และการชดเฉย ▲' : 'แสดงข้อมูล Index และการชดเฉย ▼'}
			</button>


			{showIndexSection && (
				<div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-300">
					<h3 className="text-lg font-semibold mb-3">ข้อมูล Index (i[t])</h3>
					<div className="overflow-x-auto">
						<table className="w-full border-collapse border border-gray-300 text-sm">
							<thead className="bg-gray-100">
								<tr>
									<th className="p-2 border">ปี พ.ศ.</th>
									<th className="p-2 border">ค่า index i[t]</th>
									<th className="p-2 border">นโยบายชดเฉยบำนาญ</th>
								</tr>
							</thead>
							<tbody>
								{getYearArray(startYear, endYear).map((yr) => (
									<tr key={yr} className="hover:bg-gray-50">
										<td className="p-2 border text-center">{yr}</td>
										<td className="p-2 border">
											{/* Change 2581 to let user input thenself*/}
											{(staticData[yr] && staticData[yr].i !== null && parseInt(yr) <= 2567) ? (
												<span>{staticData[yr].i.toFixed(2)}</span>
											) : (
												<input
													type="number"
													step="0.01"
													className="w-full p-1 border rounded"
													value={rateData[yr] || 1}
													onChange={(e) => handleRateDataChange(yr, e.target.value)}
													min="1"
													placeholder="Enter i (≥ 1)"
													inputMode="numeric"
												/>
											)}
										</td>
										<td className="p-2 border">
											{(staticData[yr] && staticData[yr].compensate !== null && parseInt(yr) < 2581) ? (
												<span>{staticData[yr].compensate.toFixed(0)}%</span>
											) : (
												<input
													type="number"
													step="10"
													className="w-full p-1 border rounded"
													value={conpensate[yr] || 1}
													onChange={(e) => handleRCompensateDataChange(yr, e.target.value)}
													min="0"
													inputMode="numeric"
												/>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}


			<button
				className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-4"
				onClick={handleCalculation}
			>
				คำนวณ
			</button>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					<strong>Error:</strong> {error}
				</div>
			)}
			{result && (
				<div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
						<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
							<h3 className="text-lg font-medium text-gray-700 mb-2">ฐานเงินบำนาญ</h3>
							<p className="text-2xl font-bold text-blue-800">{formatNumber(result.finalCombinedAmount)} บาท</p>
							<p className="text-sm text-gray-600">ค่าเฉลี่ยถ่วงน้ำหนักระหว่าง ม.33 และ ม.39</p>
						</div>
						<div className="bg-green-50 p-4 rounded-lg border border-green-200">
							<h3 className="text-lg font-medium text-gray-700 mb-2">เปอร์เซนต์เงินบำนาญ</h3>
							<p className="text-2xl font-bold text-purple-800">{(result.pensionPercentage * 100).toFixed(2)}%</p>
							<p className="text-sm text-gray-600">จำนวนเดือนสะสมทั้งหมด: {result.totalCumMonths[result.years[result.years.length - 1]]}</p>
						</div>
						<div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
							<h3 className="text-lg font-medium text-gray-700 mb-2">จำนวนเงินบำนาญที่ปีสิทธิ {endYear}</h3>
							<p className="text-2xl font-bold text-purple-800">{formatNumber(result.compensatedPension)} บาท</p>
							<p className="text-sm text-gray-600">*ก่อนชดเชยจะได้ {formatNumber(result.pensionAmount)} บาท (ชดเฉย {conpensate[endYear]}%)</p>
						</div>
					</div>

					<button
						className="text-blue-600 hover:text-blue-800 font-medium mb-2 flex items-center"
						onClick={() => setShowDetails(!showDetails)}
					>
						{showDetails ? "ซ่อนตารางคำนวณ ▲" : "แสดงตารางคำนวณ ▼"}
					</button>

					{showDetails && (
						<div className="overflow-x-auto">
							<table className="w-full border-collapse border border-gray-300 text-sm">
								<thead className="bg-gray-100">
									<tr>
										<th className="p-2 border">ปี</th>
										<th className="p-2 border">ReValue33(t)</th>
										<th className="p-2 border">DiscountFactor(t)</th>
										<th className="p-2 border">AdjustedAmount33(t)</th>
										<th className="p-2 border">จำนวนเดือนสะสม ม.33 W33</th>
										<th className="p-2 border">AdjustedAmount39(t)</th>
										<th className="p-2 border">จำนวนเดือนสะสม ม.39 W39</th>
									</tr>
								</thead>
								<tbody>
									{result.years.map((yr) => (
										<tr key={yr} className="hover:bg-gray-50">
											<td className="p-2 border text-center">{yr}</td>
											<td className="p-2 border text-right">{result.ReValue33[yr].toFixed(2)}</td>
											<td className="p-2 border text-right">{result.discountFactors[yr].toFixed(4)}</td>
											<td className="p-2 border text-right">{result.AdjustedAmount33[yr].toFixed(2)}</td>
											<td className="p-2 border text-right">{result.cumMonths33[yr]}</td>
											<td className="p-2 border text-right">{result.m39Values[yr].toFixed(2)}</td>
											<td className="p-2 border text-right">{result.cumMonths39[yr]}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
					<a href="/CARE_SSO_v2.0.pdf" download="CARE_SSO_v2.0.pdf" className="download-button">
						อ่านรายละเอียดเพิ่มเติม
					</a>
				</div>
			)}



		</div>
	);
};

export default CAREPensionCalculator;