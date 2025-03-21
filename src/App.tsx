import React, { useState, useEffect } from "react";
import "./App.css";

// Define TypeScript interfaces for our data structures
interface YearData {
	C: number;
	M: number;
	i: number | null;
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

interface RateDataType {
	[year: string]: string;
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
	years: string[];
}

const staticData: StaticDataType = {
	"2541": { C: 16250, M: 15000, i: 1 },
	"2542": { C: 16250, M: 15000, i: 1 },
	"2543": { C: 16250, M: 15000, i: 1.013532473 },
	"2544": { C: 16250, M: 15000, i: 1.002681959 },
	"2545": { C: 16250, M: 15000, i: 1.00730799 },
	"2546": { C: 16250, M: 15000, i: 1.012950052 },
	"2547": { C: 16250, M: 15000, i: 1.038295942 },
	"2548": { C: 16250, M: 15000, i: 1.040860045 },
	"2549": { C: 16250, M: 15000, i: 1.032125791 },
	"2550": { C: 16250, M: 15000, i: 1.036936017 },
	"2551": { C: 16250, M: 15000, i: 1.037769939 },
	"2552": { C: 16250, M: 15000, i: 1.016085747 },
	"2553": { C: 16250, M: 15000, i: 1.02656197 },
	"2554": { C: 16250, M: 15000, i: 1.119890167 },
	"2555": { C: 16250, M: 15000, i: 1.095356487 },
	"2556": { C: 16250, M: 15000, i: 1.022665963 },
	"2557": { C: 16250, M: 15000, i: 1.014171773 },
	"2558": { C: 16250, M: 15000, i: 1.033584114 },
	"2559": { C: 16250, M: 15000, i: 1.021008643 },
	"2560": { C: 16250, M: 15000, i: 1.011972516 },
	"2561": { C: 16250, M: 15000, i: 1.014638193 },
	"2562": { C: 16250, M: 15000, i: 1.00656399 },
	"2563": { C: 16250, M: 15000, i: 1.021598019 },
	"2564": { C: 16250, M: 15000, i: 1.012048193 },
	"2565": { C: 16250, M: 15000, i: 1.01207483 },
	"2566": { C: 16250, M: 15000, i: 1.023273399 },
	"2567": { C: 16250, M: 15000, i: 1.043889845 },
	"2568": { C: 16250, M: 15000, i: null },
	"2569": { C: 17500, M: 17500, i: null },
	"2570": { C: 17500, M: 17500, i: null },
	"2571": { C: 17500, M: 17500, i: null },
	"2572": { C: 20000, M: 20000, i: null },
	"2573": { C: 20000, M: 20000, i: null },
	"2574": { C: 20000, M: 20000, i: null },
	"2575": { C: 23000, M: 23000, i: null },
	"2576": { C: 23000, M: 23000, i: null },
	"2577": { C: 23000, M: 23000, i: null },
	"2578": { C: 23000, M: 23000, i: null },
	"2579": { C: 23000, M: 23000, i: null },
	"2580": { C: 23000, M: 23000, i: null },
};

const getYearArray = (start: number, end: number): string[] => {
	const years: string[] = [];
	for (let y = start; y <= end; y++) {
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
	rateData: RateDataType
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
			if (rateData[yr] === undefined || rateData[yr] === "") {
				throw new Error(`กรุณากรอกค่า i สำหรับปี ${yr}`);
			}
			iVal = parseFloat(rateData[yr]);
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
		years,
	};
};

const CAREPensionCalculator: React.FC = () => {
	const [startYear, setStartYear] = useState<number>(2542);
	const [tempStartYear, setTempStartYear] = useState<number>(2542);
	const [endYear, setEndYear] = useState<number>(2569);
	const [tempEndYear, setTempEndYear] = useState<number>(2569);
	const [moneyData, setMoneyData] = useState<MoneyDataType>({});
	const [month33Data, setMonth33Data] = useState<MonthDataType>({});
	const [month39Data, setMonth39Data] = useState<MonthDataType>({});
	const [rateData, setRateData] = useState<RateDataType>({});
	const [result, setResult] = useState<CalculationResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isInitialized, setIsInitialized] = useState<boolean>(false);
	const [showDetails, setShowDetails] = useState<boolean>(false);

	// Apply start year changes
	const applyStartYear = (): void => {
		const newStartYear = parseInt(tempStartYear.toString());
		if (newStartYear < 2541) {
			setTempStartYear(2541);
			setStartYear(2541);
			setError("ปีเริ่มต้นต้องไม่น้อยกว่า 2541");
		} else if (newStartYear > 2580) {
			setTempStartYear(2580);
			setStartYear(2580);
			setError("ปีเริ่มต้นต้องไม่เกิน 2580");
		} else if (newStartYear > endYear) {
			setEndYear(newStartYear);
			setTempEndYear(newStartYear);
			setStartYear(newStartYear);
			setError("ปรับปีสุดท้ายให้เท่ากับปีเริ่มต้น");
		} else {
			setStartYear(newStartYear);
			setError(null);
		}
		initializeYearData(newStartYear, endYear);
	};

	// Apply end year changes
	const applyEndYear = (): void => {
		const newEndYear = parseInt(tempEndYear.toString());
		if (newEndYear > 2580) {
			setTempEndYear(2580);
			setEndYear(2580);
			setError("ปีสุดท้ายต้องไม่เกิน 2580");
		} else if (newEndYear < startYear) {
			setTempEndYear(startYear);
			setEndYear(startYear);
			setError("ปีสุดท้ายต้องมากกว่าหรือเท่ากับปีเริ่มต้น");
		} else {
			setEndYear(newEndYear);
			setError(null);
		}
		initializeYearData(startYear, newEndYear);
	};

	// Keep the original Enter key handlers for desktop users
	const handleStartYearKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
		if (e.key === 'Enter') {
			applyStartYear();
		}
	};

	const handleEndYearKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
		if (e.key === 'Enter') {
			applyEndYear();
		}
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
		const m33Value = parseFloat(value);
		const m39Value = month39Data[yr] || 0;

		if (validateMonthsTotal(yr, m33Value, m39Value)) {
			setMonth33Data({
				...month33Data,
				[yr]: m33Value,
			});
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

	// Handle rate data input with validation
	const handleRateDataChange = (yr: string, value: string): void => {
		let newValue = value;

		// If the value is not empty, validate it
		if (newValue !== "") {
			const floatValue = parseFloat(newValue);

			// Don't allow values less than 1
			if (floatValue < 1) {
				newValue = "1";
			}
		}

		setRateData({
			...rateData,
			[yr]: newValue
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
					newData[yr] = prev[yr] !== undefined ? prev[yr] : "1.04";
				} else if (staticData[yr]) {
					newData[yr] = prev[yr] !== undefined ? prev[yr] : (staticData[yr].i as number).toString();
				}
			});
			return newData;
		});
		setIsInitialized(true);
	};

	// Initial setup (only once)
	useEffect(() => {
		initializeYearData(startYear, endYear);
	}, []);

	const handleCalculation = (): void => {
		setError(null);
		try {
			const years = getYearArray(startYear, endYear);
			for (const yr of years) {
				if (isNaN(moneyData[yr]) || moneyData[yr] <= 0) {
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

				if (m33Value + m39Value <= 0) {
					throw new Error(`จำนวนเดือนรวม (ม.33 + ม.39) สำหรับปี ${yr} ต้องมากกว่า 0`);
				}

				if (parseInt(yr) >= 2568) {
					if (isNaN(parseFloat(rateData[yr])) || parseFloat(rateData[yr]) <= 0) {
						throw new Error(`ค่า i ไม่ถูกต้องสำหรับปี ${yr}`);
					}
					if (parseFloat(rateData[yr]) < 1) {
						throw new Error(`ค่า i สำหรับปี ${yr} ต้องมีค่าตั้งแต่ 1 ขึ้นไป`);
					}
				}
			}
			const calcResult = calculateCARE(startYear, endYear, moneyData, month33Data, month39Data, rateData);
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
			<h1 className="text-2xl font-bold text-center mb-6 text-blue-700">CARE Pension Calculator (ม.33 และ ม.39)</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
				<div>
					<label className="block text-gray-700 mb-2">
						ปีทีี่เริ่มส่งเงินสมทบ (เช่น 2541):
						<div className="flex mt-1">
							<input
								type="number"
								className="w-full p-2 border rounded-l"
								value={tempStartYear}
								onChange={(e) => setTempStartYear(parseInt(e.target.value))}
								onKeyPress={handleStartYearKeyPress}
								min={2541}
								max={2580}
							/>
							<button
								className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r"
								onClick={applyStartYear}
							>
								ตกลง
							</button>
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
								value={tempEndYear}
								onChange={(e) => setTempEndYear(parseInt(e.target.value))}
								onKeyPress={handleEndYearKeyPress}
								min={startYear}
								max={2580}
							/>
							<button
								className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r"
								onClick={applyEndYear}
							>
								ตกลง
							</button>
						</div>
					</label>
				</div>
			</div>

			<div className="mb-6">
				<h2 className="text-xl font-semibold mb-3">กรอกข้อมูลประจำปี</h2>
				<div className="overflow-x-auto">
					<table className="w-full border-collapse border border-gray-300">
						<thead className="bg-gray-100">
							<tr>
								<th className="p-2 border">ปี</th>
								<th className="p-2 border">ค่าจ้างเฉลี่ย P[t]</th>
								<th className="p-2 border">เดือนที่ส่ง ม33 w33[t]</th>
								<th className="p-2 border">เดือนที่ส่ง ม39 w39[t]</th>
								<th className="p-2 border">ค่า index i[t]</th>
							</tr>
						</thead>
						<tbody>
							{getYearArray(startYear, endYear).map((yr) => (
								<tr key={yr} className="hover:bg-gray-50">
									<td className="p-2 border text-center">{yr}</td>
									<td className="p-2 border">
										<input
											type="number"
											className="w-24 sm:w-full p-1 border rounded text-right"
											value={moneyData[yr] || 0}
											onChange={(e) =>
												setMoneyData({
													...moneyData,
													[yr]: parseFloat(e.target.value),
												})
											}
											min="1"
											inputMode="numeric"
										/>
									</td>
									<td className="p-2 border">
										<input
											type="number"
											className="w-full p-1 border rounded"
											value={month33Data[yr] || 0}
											onChange={(e) =>
												handleMonth33Change(yr, e.target.value)
											}
											min="0"
											max="12"
											step="1"
											inputMode="numeric"
										/>
									</td>
									<td className="p-2 border">
										<input
											type="number"
											className="w-full p-1 border rounded"
											value={month39Data[yr] || 0}
											onChange={(e) =>
												handleMonth39Change(yr, e.target.value)
											}
											min="0"
											max="12"
											step="1"
											inputMode="numeric"
										/>
									</td>
									<td className="p-2 border">
										{(staticData[yr] && staticData[yr].i !== null && parseInt(yr) < 2568) ? (
											<span>{staticData[yr].i.toFixed(2)}</span>
										) : (
											<input
												type="number"
												step="0.001"
												className="w-full p-1 border rounded"
												value={rateData[yr] || ""}
												onChange={(e) => handleRateDataChange(yr, e.target.value)}
												min="1"
												placeholder="Enter i (≥ 1)"
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
							<p className="text-2xl font-bold text-blue-800">{result.finalCombinedAmount.toFixed(0)} บาท</p>
							<p className="text-sm text-gray-600">ค่าเฉลี่ยถ่วงน้ำหนักระหว่าง ม.33 และ ม.39</p>
						</div>
						<div className="bg-green-50 p-4 rounded-lg border border-green-200">
							<h3 className="text-lg font-medium text-gray-700 mb-2">เปอร์เซนต์เงินบำนาญ</h3>
							<p className="text-2xl font-bold text-purple-800">{(result.pensionPercentage * 100).toFixed(2)}%</p>
							<p className="text-sm text-gray-600">จำนวนเดือนสะสมทั้งหมด: {result.totalCumMonths[result.years[result.years.length - 1]]}</p>
						</div>
						<div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
							<h3 className="text-lg font-medium text-gray-700 mb-2">จำนวนเงินบำนาญ</h3>
							<p className="text-2xl font-bold text-purple-800">{result.pensionAmount.toFixed(0)} บาท</p>
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
										<th className="p-2 border">AdjustedAmount33(t)</th>
										<th className="p-2 border">DiscountFactor(t)</th>
										<th className="p-2 border">จำนวนเดือนสะสม ม.33 W33</th>
										<th className="p-2 border">จำนวนเดือนสะสม ม.39 W39</th>
									</tr>
								</thead>
								<tbody>
									{result.years.map((yr) => (
										<tr key={yr} className="hover:bg-gray-50">
											<td className="p-2 border text-center">{yr}</td>
											<td className="p-2 border text-right">{result.ReValue33[yr].toFixed(2)}</td>
											<td className="p-2 border text-right">{result.AdjustedAmount33[yr].toFixed(2)}</td>
											<td className="p-2 border text-right">{result.discountFactors[yr].toFixed(4)}</td>
											<td className="p-2 border text-right">{result.cumMonths33[yr]}</td>
											<td className="p-2 border text-right">{result.cumMonths39[yr]}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
					<a
						href="src/asset/CARE_SSO_v2.0pdf"
						download ="CARE_SSO_v2.0.pdf"
						className="download-button"
						style={{
							fontSize: "20px",
							padding: "12px 24px",
							backgroundColor: "#4CAF50",
							color: "white",
							textDecoration: "none",
							borderRadius: "4px",
							display: "inline-block",
							margin: "10px 0"
						}}
					>
						อ่านรายละเอียดเพิ่มเติม
					</a>
				</div>
			)}



		</div>
	);
};

export default CAREPensionCalculator;