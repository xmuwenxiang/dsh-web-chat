import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";
import { chromium } from "playwright-core";
import { realpath } from "node:fs/promises";
import { BlockAssembler, createUserMessage } from "@deepseek-ai/dsh-llm";
import { SESSION_FORMAT_VERSION, SessionId } from "@deepseek-ai/dsh-session";
import { defineTool } from "@deepseek-ai/dsh-tools";
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
//#region node_modules/.pnpm/cosmokit@1.8.1/node_modules/cosmokit/lib/index.cjs
var require_lib$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var index_exports = {};
	__export(index_exports, {
		Binary: () => Binary,
		Time: () => Time,
		arrayBufferToBase64: () => arrayBufferToBase64,
		arrayBufferToHex: () => arrayBufferToHex,
		base64ToArrayBuffer: () => base64ToArrayBuffer,
		camelCase: () => camelCase,
		camelize: () => camelize,
		capitalize: () => capitalize,
		clone: () => clone,
		contain: () => contain,
		deduplicate: () => deduplicate,
		deepEqual: () => deepEqual,
		defineProperty: () => defineProperty,
		difference: () => difference,
		filterKeys: () => filterKeys,
		formatProperty: () => formatProperty,
		hexToArrayBuffer: () => hexToArrayBuffer,
		hyphenate: () => hyphenate,
		intersection: () => intersection,
		is: () => is,
		isNonNullable: () => isNonNullable,
		isNullable: () => isNullable,
		isPlainObject: () => isPlainObject,
		makeArray: () => makeArray,
		mapValues: () => mapValues,
		noop: () => noop,
		omit: () => omit,
		paramCase: () => paramCase,
		pick: () => pick,
		remove: () => remove,
		sanitize: () => sanitize,
		snakeCase: () => snakeCase,
		trimSlash: () => trimSlash,
		uncapitalize: () => uncapitalize,
		union: () => union,
		valueMap: () => mapValues
	});
	module.exports = __toCommonJS(index_exports);
	function noop() {}
	function isNullable(value) {
		return value === null || value === void 0;
	}
	function isNonNullable(value) {
		return !isNullable(value);
	}
	function isPlainObject(data) {
		return data && typeof data === "object" && !Array.isArray(data);
	}
	function filterKeys(object, filter) {
		return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
	}
	function mapValues(object, transform) {
		return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
	}
	function pick(source, keys, forced) {
		if (!keys) return { ...source };
		const result = {};
		for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
		return result;
	}
	function omit(source, keys) {
		if (!keys) return { ...source };
		const result = { ...source };
		for (const key of keys) Reflect.deleteProperty(result, key);
		return result;
	}
	function defineProperty(object, key, value) {
		return Object.defineProperty(object, key, {
			writable: true,
			value,
			enumerable: false
		});
	}
	function contain(array1, array2) {
		return array2.every((item) => array1.includes(item));
	}
	function intersection(array1, array2) {
		return array1.filter((item) => array2.includes(item));
	}
	function difference(array1, array2) {
		return array1.filter((item) => !array2.includes(item));
	}
	function union(array1, array2) {
		return Array.from(/* @__PURE__ */ new Set([...array1, ...array2]));
	}
	function deduplicate(array) {
		return [...new Set(array)];
	}
	function remove(list, item) {
		const index = list?.indexOf(item);
		if (index >= 0) {
			list.splice(index, 1);
			return true;
		} else return false;
	}
	function makeArray(source) {
		return Array.isArray(source) ? source : isNullable(source) ? [] : [source];
	}
	function is(type, value) {
		if (arguments.length === 1) return (value2) => is(type, value2);
		return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
	}
	function isArrayBufferLike(value) {
		return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
	}
	function isArrayBufferSource(value) {
		return isArrayBufferLike(value) || ArrayBuffer.isView(value);
	}
	var Binary;
	((Binary2) => {
		Binary2.is = isArrayBufferLike;
		Binary2.isSource = isArrayBufferSource;
		function fromSource(source) {
			if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
			else return source;
		}
		Binary2.fromSource = fromSource;
		function toBase64(source) {
			source = fromSource(source);
			if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
			let binary = "";
			const bytes = new Uint8Array(source);
			for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
			return btoa(binary);
		}
		Binary2.toBase64 = toBase64;
		function fromBase64(source) {
			if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
			return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
		}
		Binary2.fromBase64 = fromBase64;
		function toHex(source) {
			source = fromSource(source);
			if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
			return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
		}
		Binary2.toHex = toHex;
		function fromHex(source) {
			if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
			const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
			const buffer = [];
			for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
			return Uint8Array.from(buffer).buffer;
		}
		Binary2.fromHex = fromHex;
	})(Binary || (Binary = {}));
	var base64ToArrayBuffer = Binary.fromBase64;
	var arrayBufferToBase64 = Binary.toBase64;
	var hexToArrayBuffer = Binary.fromHex;
	var arrayBufferToHex = Binary.toHex;
	function clone(source, refs = /* @__PURE__ */ new Map()) {
		if (!source || typeof source !== "object") return source;
		if (is("Date", source)) return new Date(source.valueOf());
		if (is("RegExp", source)) return new RegExp(source.source, source.flags);
		if (isArrayBufferLike(source)) return source.slice(0);
		if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
		const cached = refs.get(source);
		if (cached) return cached;
		if (Array.isArray(source)) {
			const result2 = [];
			refs.set(source, result2);
			source.forEach((value, index) => {
				result2[index] = Reflect.apply(clone, null, [value, refs]);
			});
			return result2;
		}
		const result = Object.create(Object.getPrototypeOf(source));
		refs.set(source, result);
		for (const key of Reflect.ownKeys(source)) {
			const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
			if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
			Reflect.defineProperty(result, key, descriptor);
		}
		return result;
	}
	function deepEqual(a, b, strict) {
		if (a === b) return true;
		if (!strict && isNullable(a) && isNullable(b)) return true;
		if (typeof a !== typeof b) return false;
		if (typeof a !== "object") return false;
		if (!a || !b) return false;
		function check(test, then) {
			return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
		}
		return check(Array.isArray, (a2, b2) => a2.length === b2.length && a2.every((item, index) => deepEqual(item, b2[index]))) ?? check(is("Date"), (a2, b2) => a2.valueOf() === b2.valueOf()) ?? check(is("RegExp"), (a2, b2) => a2.source === b2.source && a2.flags === b2.flags) ?? check(isArrayBufferLike, (a2, b2) => {
			if (a2.byteLength !== b2.byteLength) return false;
			const viewA = new Uint8Array(a2);
			const viewB = new Uint8Array(b2);
			for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
			return true;
		}) ?? Object.keys({
			...a,
			...b
		}).every((key) => deepEqual(a[key], b[key], strict));
	}
	function capitalize(source) {
		return source.charAt(0).toUpperCase() + source.slice(1);
	}
	function uncapitalize(source) {
		return source.charAt(0).toLowerCase() + source.slice(1);
	}
	function camelCase(source) {
		return source.replace(/[_-][a-z]/g, (str) => str.slice(1).toUpperCase());
	}
	function tokenize(source, delimiters, delimiter) {
		const output = [];
		let state = 0;
		for (let i = 0; i < source.length; i++) {
			const code = source.charCodeAt(i);
			if (code >= 65 && code <= 90) {
				if (state === 1) {
					const next = source.charCodeAt(i + 1);
					if (next >= 97 && next <= 122) output.push(delimiter);
					output.push(code + 32);
				} else {
					if (state !== 0) output.push(delimiter);
					output.push(code + 32);
				}
				state = 1;
			} else if (code >= 97 && code <= 122) {
				output.push(code);
				state = 2;
			} else if (delimiters.includes(code)) {
				if (state !== 0) output.push(delimiter);
				state = 0;
			} else output.push(code);
		}
		return String.fromCharCode(...output);
	}
	function paramCase(source) {
		return tokenize(source, [45, 95], 45);
	}
	function snakeCase(source) {
		return tokenize(source, [45, 95], 95);
	}
	var camelize = camelCase;
	var hyphenate = paramCase;
	function formatProperty(key) {
		if (typeof key !== "string") return `[${key.toString()}]`;
		return /^[a-z_$][\w$]*$/i.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`;
	}
	function trimSlash(source) {
		return source.replace(/\/$/, "");
	}
	function sanitize(source) {
		if (!source.startsWith("/")) source = "/" + source;
		return trimSlash(source);
	}
	var Time;
	((Time2) => {
		Time2.millisecond = 1;
		Time2.second = 1e3;
		Time2.minute = Time2.second * 60;
		Time2.hour = Time2.minute * 60;
		Time2.day = Time2.hour * 24;
		Time2.week = Time2.day * 7;
		let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
		function setTimezoneOffset(offset) {
			timezoneOffset = offset;
		}
		Time2.setTimezoneOffset = setTimezoneOffset;
		function getTimezoneOffset() {
			return timezoneOffset;
		}
		Time2.getTimezoneOffset = getTimezoneOffset;
		function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
			if (typeof date === "number") date = new Date(date);
			if (offset === void 0) offset = timezoneOffset;
			return Math.floor((date.valueOf() / Time2.minute - offset) / 1440);
		}
		Time2.getDateNumber = getDateNumber;
		function fromDateNumber(value, offset) {
			const date = new Date(value * Time2.day);
			if (offset === void 0) offset = timezoneOffset;
			return new Date(+date + offset * Time2.minute);
		}
		Time2.fromDateNumber = fromDateNumber;
		const numeric = /\d+(?:\.\d+)?/.source;
		const timeRegExp = new RegExp(`^${[
			"w(?:eek(?:s)?)?",
			"d(?:ay(?:s)?)?",
			"h(?:our(?:s)?)?",
			"m(?:in(?:ute)?(?:s)?)?",
			"s(?:ec(?:ond)?(?:s)?)?"
		].map((unit) => `(${numeric}${unit})?`).join("")}$`);
		function parseTime(source) {
			const capture = timeRegExp.exec(source);
			if (!capture) return 0;
			return (parseFloat(capture[1]) * Time2.week || 0) + (parseFloat(capture[2]) * Time2.day || 0) + (parseFloat(capture[3]) * Time2.hour || 0) + (parseFloat(capture[4]) * Time2.minute || 0) + (parseFloat(capture[5]) * Time2.second || 0);
		}
		Time2.parseTime = parseTime;
		function parseDate(date) {
			const parsed = parseTime(date);
			if (parsed) date = Date.now() + parsed;
			else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
			else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
			return date ? new Date(date) : /* @__PURE__ */ new Date();
		}
		Time2.parseDate = parseDate;
		function format(ms) {
			const abs = Math.abs(ms);
			if (abs >= Time2.day - Time2.hour / 2) return Math.round(ms / Time2.day) + "d";
			else if (abs >= Time2.hour - Time2.minute / 2) return Math.round(ms / Time2.hour) + "h";
			else if (abs >= Time2.minute - Time2.second / 2) return Math.round(ms / Time2.minute) + "m";
			else if (abs >= Time2.second) return Math.round(ms / Time2.second) + "s";
			return ms + "ms";
		}
		Time2.format = format;
		function toDigits(source, length = 2) {
			return source.toString().padStart(length, "0");
		}
		Time2.toDigits = toDigits;
		function template(template2, time = /* @__PURE__ */ new Date()) {
			return template2.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
		}
		Time2.template = template;
	})(Time || (Time = {}));
	0 && (module.exports = {
		Binary,
		Time,
		arrayBufferToBase64,
		arrayBufferToHex,
		base64ToArrayBuffer,
		camelCase,
		camelize,
		capitalize,
		clone,
		contain,
		deduplicate,
		deepEqual,
		defineProperty,
		difference,
		filterKeys,
		formatProperty,
		hexToArrayBuffer,
		hyphenate,
		intersection,
		is,
		isNonNullable,
		isNullable,
		isPlainObject,
		makeArray,
		mapValues,
		noop,
		omit,
		paramCase,
		pick,
		remove,
		sanitize,
		snakeCase,
		trimSlash,
		uncapitalize,
		union,
		valueMap
	});
}));
//#endregion
//#region src/engine/html-md.ts
var import_lib = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __defProp = Object.defineProperty;
	var __name = (target, value) => __defProp(target, "name", {
		value,
		configurable: true
	});
	var import_cosmokit = require_lib$1();
	var kSchema = Symbol.for("schemastery");
	var kValidationError = Symbol.for("ValidationError");
	globalThis.__schemastery_index__ ??= 0;
	globalThis.__schemastery_refs__ = void 0;
	var ValidationError = class extends TypeError {
		constructor(message, options) {
			let prefix = "$";
			for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
			else if (typeof segment === "number") prefix += "[" + segment + "]";
			else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
			if (prefix.startsWith(".")) prefix = prefix.slice(1);
			super((prefix === "$" ? "" : `${prefix} `) + message);
			this.options = options;
		}
		static {
			__name(this, "ValidationError");
		}
		name = "ValidationError";
		static is(error) {
			return !!error?.[kValidationError];
		}
	};
	Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
	var Schema = /* @__PURE__ */ __name(function(options) {
		const schema = /* @__PURE__ */ __name(function(data, options2 = {}) {
			return Schema.resolve(data, schema, options2)[0];
		}, "schema");
		if (options.refs) {
			const refs = (0, import_cosmokit.valueMap)(options.refs, (options2) => new Schema(options2));
			const getRef = /* @__PURE__ */ __name((uid) => refs[uid], "getRef");
			for (const key in refs) {
				const options2 = refs[key];
				options2.sKey = getRef(options2.sKey);
				options2.inner = getRef(options2.inner);
				options2.list = options2.list && options2.list.map(getRef);
				options2.dict = options2.dict && (0, import_cosmokit.valueMap)(options2.dict, getRef);
			}
			return refs[options.uid];
		}
		Object.assign(schema, options);
		if (typeof schema.callback === "string") try {
			schema.callback = new Function("return " + schema.callback)();
		} catch {}
		Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
		Object.setPrototypeOf(schema, Schema.prototype);
		schema.meta ||= {};
		schema.toString = schema.toString.bind(schema);
		return schema;
	}, "Schema");
	Schema.prototype = Object.create(Function.prototype);
	Schema.prototype[kSchema] = true;
	Object.defineProperty(Schema.prototype, "~standard", { get() {
		return {
			version: 1,
			vendor: "schemastery",
			validate: /* @__PURE__ */ __name((value) => {
				try {
					return { value: Schema.resolve(value, this, {})[0] };
				} catch (error) {
					if (ValidationError.is(error)) return { issues: [{
						message: error.message,
						path: error.options.path
					}] };
					throw error;
				}
			}, "validate")
		};
	} });
	Schema.ValidationError = ValidationError;
	Schema.prototype.toJSON = /* @__PURE__ */ __name(function toJSON() {
		if (globalThis.__schemastery_refs__) {
			globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
			return this.uid;
		}
		globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
		globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
		const result = {
			uid: this.uid,
			refs: globalThis.__schemastery_refs__
		};
		globalThis.__schemastery_refs__ = void 0;
		return result;
	}, "toJSON");
	Schema.prototype.set = /* @__PURE__ */ __name(function set(key, value) {
		this.dict[key] = value;
		return this;
	}, "set");
	Schema.prototype.push = /* @__PURE__ */ __name(function push(value) {
		this.list.push(value);
		return this;
	}, "push");
	function mergeDesc(original, messages) {
		const result = typeof original === "string" ? { "": original } : { ...original };
		for (const locale in messages) {
			const value = messages[locale];
			if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
			else if (typeof value === "string") result[locale] = value;
		}
		return result;
	}
	__name(mergeDesc, "mergeDesc");
	function getInner(value) {
		return value?.$value ?? value?.$inner;
	}
	__name(getInner, "getInner");
	function extractKeys(data) {
		return (0, import_cosmokit.filterKeys)(data ?? {}, (key) => !key.startsWith("$"));
	}
	__name(extractKeys, "extractKeys");
	Schema.prototype.i18n = /* @__PURE__ */ __name(function i18n(messages) {
		const schema = Schema(this);
		const desc = mergeDesc(schema.meta.description, messages);
		if (Object.keys(desc).length) schema.meta.description = desc;
		if (schema.dict) schema.dict = (0, import_cosmokit.valueMap)(schema.dict, (inner, key) => {
			return inner.i18n((0, import_cosmokit.valueMap)(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
		});
		if (schema.list) schema.list = schema.list.map((inner, index) => {
			return inner.i18n((0, import_cosmokit.valueMap)(messages, (data = {}) => {
				if (Array.isArray(getInner(data))) return getInner(data)[index];
				if (Array.isArray(data)) return data[index];
				return extractKeys(data);
			}));
		});
		if (schema.inner) schema.inner = schema.inner.i18n((0, import_cosmokit.valueMap)(messages, (data) => {
			if (getInner(data)) return getInner(data);
			return extractKeys(data);
		}));
		if (schema.sKey) schema.sKey = schema.sKey.i18n((0, import_cosmokit.valueMap)(messages, (data) => data?.$key));
		return schema;
	}, "i18n");
	Schema.prototype.extra = /* @__PURE__ */ __name(function extra(key, value) {
		const schema = Schema(this);
		schema.meta = {
			...schema.meta,
			[key]: value
		};
		return schema;
	}, "extra");
	for (const key of [
		"required",
		"disabled",
		"collapse",
		"hidden",
		"loose"
	]) Object.assign(Schema.prototype, { [key](value = true) {
		const schema = Schema(this);
		schema.meta = {
			...schema.meta,
			[key]: value
		};
		return schema;
	} });
	Schema.prototype.deprecated = /* @__PURE__ */ __name(function deprecated() {
		const schema = Schema(this);
		schema.meta.badges ||= [];
		schema.meta.badges.push({
			text: "deprecated",
			type: "danger"
		});
		return schema;
	}, "deprecated");
	Schema.prototype.experimental = /* @__PURE__ */ __name(function experimental() {
		const schema = Schema(this);
		schema.meta.badges ||= [];
		schema.meta.badges.push({
			text: "experimental",
			type: "warning"
		});
		return schema;
	}, "experimental");
	Schema.prototype.pattern = /* @__PURE__ */ __name(function pattern(regexp) {
		const schema = Schema(this);
		const pattern2 = (0, import_cosmokit.pick)(regexp, ["source", "flags"]);
		schema.meta = {
			...schema.meta,
			pattern: pattern2
		};
		return schema;
	}, "pattern");
	Schema.prototype.simplify = /* @__PURE__ */ __name(function simplify(value) {
		if ((0, import_cosmokit.deepEqual)(value, this.meta.default, this.type === "dict")) return null;
		if ((0, import_cosmokit.isNullable)(value)) return value;
		if (this.type === "object" || this.type === "dict") {
			const result = {};
			for (const key in value) {
				const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
				if (this.type === "dict" || !(0, import_cosmokit.isNullable)(item)) result[key] = item;
			}
			if ((0, import_cosmokit.deepEqual)(result, this.meta.default, this.type === "dict")) return null;
			return result;
		} else if (this.type === "array" || this.type === "tuple") {
			const result = [];
			value.forEach((value2, index) => {
				const schema = this.type === "array" ? this.inner : this.list[index];
				const item = schema ? schema.simplify(value2) : value2;
				result.push(item);
			});
			return result;
		} else if (this.type === "intersect") {
			const result = {};
			for (const item of this.list) Object.assign(result, item.simplify(value));
			return result;
		} else if (this.type === "union") for (const schema of this.list) try {
			Schema.resolve(value, schema, {});
			return schema.simplify(value);
		} catch {}
		return value;
	}, "simplify");
	Schema.prototype.toString = /* @__PURE__ */ __name(function toString(inline) {
		return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
	}, "toString");
	Schema.prototype.role = /* @__PURE__ */ __name(function role(role, extra2) {
		const schema = Schema(this);
		schema.meta = {
			...schema.meta,
			role,
			extra: extra2
		};
		return schema;
	}, "role");
	for (const key of [
		"default",
		"link",
		"comment",
		"description",
		"max",
		"min",
		"step"
	]) Object.assign(Schema.prototype, { [key](value) {
		const schema = Schema(this);
		schema.meta = {
			...schema.meta,
			[key]: value
		};
		return schema;
	} });
	var resolvers = {};
	Schema.extend = /* @__PURE__ */ __name(function extend(type, resolve2) {
		resolvers[type] = resolve2;
	}, "extend");
	Schema.resolve = /* @__PURE__ */ __name(function resolve(data, schema, options = {}, strict = false) {
		if (!schema) return [data];
		if (options.ignore?.(data, schema)) return [data];
		if ((0, import_cosmokit.isNullable)(data) && schema.type !== "lazy") {
			if (schema.meta.required) throw new ValidationError(`missing required value`, options);
			let current = schema;
			let fallback = schema.meta.default;
			while (current?.type === "intersect" && (0, import_cosmokit.isNullable)(fallback)) {
				current = current.list[0];
				fallback = current?.meta.default;
			}
			if ((0, import_cosmokit.isNullable)(fallback)) return [data];
			data = (0, import_cosmokit.clone)(fallback);
		}
		const callback = resolvers[schema.type];
		if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
		try {
			return callback(data, schema, options, strict);
		} catch (error) {
			if (!schema.meta.loose) throw error;
			return [schema.meta.default];
		}
	}, "resolve");
	Schema.from = /* @__PURE__ */ __name(function from(source) {
		if ((0, import_cosmokit.isNullable)(source)) return Schema.any();
		else if ([
			"string",
			"number",
			"boolean"
		].includes(typeof source)) return Schema.const(source).required();
		else if (source[kSchema]) return source;
		else if (typeof source === "function") switch (source) {
			case String: return Schema.string().required();
			case Number: return Schema.number().required();
			case Boolean: return Schema.boolean().required();
			case Function: return Schema.function().required();
			default: return Schema.is(source).required();
		}
		else throw new TypeError(`cannot infer schema from ${source}`);
	}, "from");
	Schema.lazy = /* @__PURE__ */ __name(function lazy(builder) {
		const schema = new Schema({
			type: "lazy",
			builder,
			inner: { toJSON: /* @__PURE__ */ __name(() => {
				if (!schema.inner[kSchema]) {
					schema.inner = schema.builder();
					schema.inner.meta = {
						...schema.meta,
						...schema.inner.meta
					};
				}
				return schema.inner.toJSON();
			}, "toJSON") }
		});
		return schema;
	}, "lazy");
	Schema.natural = /* @__PURE__ */ __name(function natural() {
		return Schema.number().step(1).min(0);
	}, "natural");
	Schema.percent = /* @__PURE__ */ __name(function percent() {
		return Schema.number().step(.01).min(0).max(1).role("slider");
	}, "percent");
	Schema.date = /* @__PURE__ */ __name(function date() {
		return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
			const date2 = new Date(value);
			if (isNaN(+date2)) throw new ValidationError(`invalid date "${value}"`, options);
			return date2;
		}, true)]);
	}, "date");
	Schema.regExp = /* @__PURE__ */ __name(function regExp(flag = "") {
		return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
			try {
				return new RegExp(value, flag);
			} catch (e) {
				throw new ValidationError(e.message, options);
			}
		}, true)]);
	}, "regExp");
	Schema.arrayBuffer = /* @__PURE__ */ __name(function arrayBuffer(encoding) {
		return Schema.union([
			Schema.is(ArrayBuffer),
			Schema.is(SharedArrayBuffer),
			Schema.transform(Schema.any(), (value, options) => {
				if (import_cosmokit.Binary.isSource(value)) return import_cosmokit.Binary.fromSource(value);
				throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
			}, true),
			...encoding ? [Schema.transform(Schema.string(), (value, options) => {
				try {
					return encoding === "base64" ? import_cosmokit.Binary.fromBase64(value) : import_cosmokit.Binary.fromHex(value);
				} catch (e) {
					throw new ValidationError(e.message, options);
				}
			}, true)] : []
		]);
	}, "arrayBuffer");
	Schema.extend("lazy", (data, schema, options, strict) => {
		if (!schema.inner[kSchema]) {
			schema.inner = schema.builder();
			schema.inner.meta = {
				...schema.meta,
				...schema.inner.meta
			};
		}
		return Schema.resolve(data, schema.inner, options, strict);
	});
	Schema.extend("any", (data) => {
		return [data];
	});
	Schema.extend("never", (data, _, options) => {
		throw new ValidationError(`expected nullable but got ${data}`, options);
	});
	Schema.extend("const", (data, { value }, options) => {
		if ((0, import_cosmokit.deepEqual)(data, value)) return [value];
		throw new ValidationError(`expected ${value} but got ${data}`, options);
	});
	function checkWithinRange(data, meta, description, options, skipMin = false) {
		const { max = Infinity, min = -Infinity } = meta;
		if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
		if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
	}
	__name(checkWithinRange, "checkWithinRange");
	Schema.extend("string", (data, { meta }, options) => {
		if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
		if (meta.pattern) {
			const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
			if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
		}
		checkWithinRange(data.length, meta, "string length", options);
		return [data];
	});
	function decimalShift(data, digits) {
		const str = data.toString();
		if (str.includes("e")) return data * Math.pow(10, digits);
		const index = str.indexOf(".");
		if (index === -1) return data * Math.pow(10, digits);
		const frac = str.slice(index + 1);
		const integer = str.slice(0, index);
		if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
		return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
	}
	__name(decimalShift, "decimalShift");
	function isMultipleOf(data, min, step) {
		step = Math.abs(step);
		if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
		const index = step.toString().indexOf(".");
		const digits = step.toString().slice(index + 1).length;
		return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
	}
	__name(isMultipleOf, "isMultipleOf");
	Schema.extend("number", (data, { meta }, options) => {
		if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
		checkWithinRange(data, meta, "number", options);
		const { step } = meta;
		if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
		return [data];
	});
	Schema.extend("boolean", (data, _, options) => {
		if (typeof data === "boolean") return [data];
		throw new ValidationError(`expected boolean but got ${data}`, options);
	});
	Schema.extend("bitset", (data, { bits, meta }, options) => {
		let value = 0, keys = [];
		if (typeof data === "number") {
			value = data;
			for (const key in bits) if (data & bits[key]) keys.push(key);
		} else if (Array.isArray(data)) {
			keys = data;
			for (const key of keys) {
				if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
				if (key in bits) value |= bits[key];
			}
		} else throw new ValidationError(`expected number or array but got ${data}`, options);
		if (value === meta.default) return [value];
		return [value, keys];
	});
	Schema.extend("function", (data, _, options) => {
		if (typeof data === "function") return [data];
		throw new ValidationError(`expected function but got ${data}`, options);
	});
	Schema.extend("is", (data, { constructor }, options) => {
		if (typeof constructor === "function") {
			if (data instanceof constructor) return [data];
			throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
		} else {
			if ((0, import_cosmokit.isNullable)(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
			let prototype = Object.getPrototypeOf(data);
			while (prototype) {
				if (prototype.constructor?.name === constructor) return [data];
				prototype = Object.getPrototypeOf(prototype);
			}
			throw new ValidationError(`expected ${constructor} but got ${data}`, options);
		}
	});
	function property(data, key, schema, options) {
		try {
			const [value, adapted] = Schema.resolve(data[key], schema, {
				...options,
				path: [...options.path || [], key]
			});
			if (adapted !== void 0) data[key] = adapted;
			return value;
		} catch (e) {
			if (!options?.autofix) throw e;
			delete data[key];
			return schema.meta.default;
		}
	}
	__name(property, "property");
	Schema.extend("array", (data, { inner, meta }, options) => {
		if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
		checkWithinRange(data.length, meta, "array length", options, !(0, import_cosmokit.isNullable)(inner.meta.default));
		return [data.map((_, index) => property(data, index, inner, options))];
	});
	Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
		if (!(0, import_cosmokit.isPlainObject)(data)) throw new ValidationError(`expected object but got ${data}`, options);
		const result = {};
		for (const key in data) {
			let rKey;
			try {
				rKey = Schema.resolve(key, sKey, options)[0];
			} catch (error) {
				if (strict) continue;
				throw error;
			}
			result[rKey] = property(data, key, inner, options);
			data[rKey] = data[key];
			if (key !== rKey) delete data[key];
		}
		return [result];
	});
	Schema.extend("tuple", (data, { list }, options, strict) => {
		if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
		const result = list.map((inner, index) => property(data, index, inner, options));
		if (strict) return [result];
		result.push(...data.slice(list.length));
		return [result];
	});
	function merge(result, data) {
		for (const key in data) {
			if (key in result) continue;
			result[key] = data[key];
		}
	}
	__name(merge, "merge");
	Schema.extend("object", (data, { dict }, options, strict) => {
		if (!(0, import_cosmokit.isPlainObject)(data)) throw new ValidationError(`expected object but got ${data}`, options);
		const result = {};
		for (const key in dict) {
			const value = property(data, key, dict[key], options);
			if (!(0, import_cosmokit.isNullable)(value) || key in data) result[key] = value;
		}
		if (!strict) merge(result, data);
		return [result];
	});
	Schema.extend("union", (data, { list, toString: toString2 }, options, strict) => {
		const messages = [];
		for (const inner of list) try {
			return Schema.resolve(data, inner, options, strict);
		} catch (error) {
			messages.push(error);
		}
		throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
	});
	Schema.extend("intersect", (data, { list, toString: toString2 }, options, strict) => {
		if (!list.length) return [data];
		let result;
		for (const inner of list) {
			const value = Schema.resolve(data, inner, options, true)[0];
			if ((0, import_cosmokit.isNullable)(value)) continue;
			if ((0, import_cosmokit.isNullable)(result)) result = value;
			else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
			else if (typeof value === "object") merge(result ??= {}, value);
			else if (result !== value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
		}
		if (!strict && (0, import_cosmokit.isPlainObject)(data)) merge(result, data);
		return [result];
	});
	Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
		const [result, adapted = data] = Schema.resolve(data, inner, options, true);
		if (preserve) return [callback(result)];
		else return [callback(result), callback(adapted)];
	});
	var formatters = {};
	function defineMethod(name, keys, format) {
		formatters[name] = format;
		Object.assign(Schema, { [name](...args) {
			const schema = new Schema({ type: name });
			keys.forEach((key, index) => {
				switch (key) {
					case "sKey":
						schema.sKey = args[index] ?? Schema.string();
						break;
					case "inner":
						schema.inner = Schema.from(args[index]);
						break;
					case "list":
						schema.list = args[index].map(Schema.from);
						break;
					case "dict":
						schema.dict = (0, import_cosmokit.valueMap)(args[index], Schema.from);
						break;
					case "bits":
						schema.bits = {};
						for (const key2 in args[index]) {
							if (typeof args[index][key2] !== "number") continue;
							schema.bits[key2] = args[index][key2];
						}
						break;
					case "callback": {
						const callback = schema.callback = args[index];
						callback["toJSON"] ||= () => callback.toString();
						break;
					}
					case "constructor": {
						const constructor = schema.constructor = args[index];
						if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
						break;
					}
					default: schema[key] = args[index];
				}
			});
			if (name === "object" || name === "dict") schema.meta.default = {};
			else if (name === "array" || name === "tuple") schema.meta.default = [];
			else if (name === "bitset") schema.meta.default = 0;
			return schema;
		} });
	}
	__name(defineMethod, "defineMethod");
	defineMethod("is", ["constructor"], ({ constructor }) => {
		if (typeof constructor === "function") return constructor.name;
		else return constructor;
	});
	defineMethod("any", [], () => "any");
	defineMethod("never", [], () => "never");
	defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
	defineMethod("string", [], () => "string");
	defineMethod("number", [], () => "number");
	defineMethod("boolean", [], () => "boolean");
	defineMethod("bitset", ["bits"], () => "bitset");
	defineMethod("function", [], () => "function");
	defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
	defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
	defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
	defineMethod("object", ["dict"], ({ dict }) => {
		if (Object.keys(dict).length === 0) return "{}";
		return `{ ${Object.entries(dict).map(([key, inner]) => {
			return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
		}).join(", ")} }`;
	});
	defineMethod("union", ["list"], ({ list }, inline) => {
		const result = list.map(({ toString: format }) => format()).join(" | ");
		return inline ? `(${result})` : result;
	});
	defineMethod("intersect", ["list"], ({ list }) => {
		return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
	});
	defineMethod("transform", [
		"inner",
		"callback",
		"preserve"
	], ({ inner }, isInner) => inner.toString(isInner));
	module.exports = Schema;
})))(), 1);
/**
* Minimal HTML → Markdown converter used to scrape DeepSeek's rendered
* `.ds-markdown` replies. Covers the shapes DeepSeek renders (headings,
* paragraphs, code blocks with syntax classes, inline code, bold/italic,
* links, images, lists, tables, blockquotes, math placeholders). Anything
* unrecognized falls back to its text content — fidelity loss degrades
* gracefully instead of dropping text.
*/
/** Escape text that could be parsed as markdown markup. */
function escapeText(text) {
	return text.replace(/([\\`*_[\]<>])/g, "\\$1").replace(/\n{3,}/g, "\n\n");
}
const TEXT_NODE = 3;
/** Convert one DOM subtree (element or text) to markdown. */
function htmlToMarkdown(root) {
	if (root === null || root === void 0) return "";
	if (root.nodeType === TEXT_NODE) return escapeText(root.textContent ?? "");
	const tag = (root.tagName ?? "").toLowerCase();
	const text = (children) => (children ?? []).map(htmlToMarkdown).join("");
	switch (tag) {
		case "br": return "\n";
		case "hr": return "\n---\n";
		case "h1":
		case "h2":
		case "h3":
		case "h4":
		case "h5":
		case "h6": {
			const level = Number(tag[1]);
			return `\n${"#".repeat(level)} ${text(root.children).trim()}\n`;
		}
		case "p": return `\n${text(root.children).trim()}\n`;
		case "strong":
		case "b": return `**${text(root.children).trim()}**`;
		case "em":
		case "i": return `*${text(root.children).trim()}*`;
		case "code":
			if (root.parent?.tagName?.toLowerCase() === "pre") return text(root.children);
			return `\`${(root.textContent ?? "").replace(/`/g, "\\`")}\``;
		case "pre": {
			const code = root.children?.find((child) => (child.tagName ?? "").toLowerCase() === "code") ?? root;
			const raw = code.textContent ?? "";
			const className = code.className ?? "";
			const language = /language-([a-zA-Z0-9_+-]+)/.exec(className)?.[1] ?? "";
			const fence = "```";
			return `\n${fence}${language}\n${raw.replace(/\n$/, "")}\n${fence}\n`;
		}
		case "a": {
			const href = root.attributes?.href;
			const label = text(root.children).trim();
			if (href === void 0 || href === "" || href.startsWith("javascript:")) return label;
			return `[${label || href}](${href})`;
		}
		case "img": {
			const src = root.attributes?.src;
			const alt = root.attributes?.alt ?? "";
			return src === void 0 ? "" : `![${alt}](${src})`;
		}
		case "ul": return `\n${(root.children ?? []).map((child) => {
			if ((child.tagName ?? "").toLowerCase() === "li") return `- ${text(child.children).trim()}`;
			return htmlToMarkdown(child);
		}).join("\n")}\n`;
		case "ol": {
			let index = 1;
			return `\n${(root.children ?? []).map((child) => {
				if ((child.tagName ?? "").toLowerCase() === "li") return `${index++}. ${text(child.children).trim()}`;
				return htmlToMarkdown(child);
			}).join("\n")}\n`;
		}
		case "li": return text(root.children).trim();
		case "blockquote": return `\n> ${text(root.children).trim().replace(/\n/g, "\n> ")}\n`;
		case "table": {
			const rows = (root.children ?? []).filter((child) => (child.tagName ?? "").toLowerCase() === "tr");
			if (rows.length === 0) return text(root.children).trim();
			const cellsOf = (row) => (row.children ?? []).filter((child) => ["th", "td"].includes((child.tagName ?? "").toLowerCase())).map((cell) => text(cell.children).trim().replace(/\|/g, "\\|"));
			const header = cellsOf(rows[0]);
			const body = rows.slice(1).map(cellsOf);
			const width = Math.max(header.length, ...body.map((row) => row.length));
			const pad = (cells) => {
				const filled = [...cells];
				while (filled.length < width) filled.push("");
				return `| ${filled.join(" | ")} |`;
			};
			return `\n${[
				pad(header),
				`| ${Array.from({ length: width }, () => "---").join(" | ")} |`,
				...body.map(pad)
			].join("\n")}\n`;
		}
		case "tr":
		case "td":
		case "th":
		case "thead":
		case "tbody":
		case "tfoot": return text(root.children);
		case "details": return `\n<details>\n${text(root.children)}\n</details>\n`;
		case "summary": return `**${text(root.children).trim()}**`;
		case "input": return root.attributes?.checked !== void 0 ? "[x] " : "[ ] ";
		case "math": return `$${root.textContent ?? ""}$`;
		case "svg":
		case "button":
		case "script":
		case "style": return "";
		case "div":
		case "span":
		case "section":
		case "article":
		case "main": return text(root.children);
		default: return text(root.children);
	}
}
/** Convert serialized DOM (from the in-page scraper) to markdown. */
function serializeToMarkdown(root) {
	return htmlToMarkdown(root).replace(/\n{3,}/g, "\n\n").trim();
}
//#endregion
//#region src/engine/engine.ts
/**
* DeepSeek web engine — the "Codex ChatGPT mode" analog for DeepSeek Harness.
*
* Drives a real browser (system Chrome/Edge via playwright-core) against
* chat.deepseek.com with a dedicated persistent profile, so the user logs in
* once with their own DeepSeek account (phone / password / Apple / WeChat QR)
* and the session persists. Chatting happens THROUGH the real web page —
* messages are typed into the real composer — so the plugin needs no API key,
* no billing, and stays immune to DeepSeek's private-API PoW challenge.
*
* Replies are read by teeing the page's own SSE stream: an injected init
* script wraps XMLHttpRequest and captures the `/api/v0/chat/completion`
* response as it streams (the page has already solved PoW + auth, so we get
* the model's raw markdown for free). DOM scraping of `.ds-markdown` is kept
* only as a fallback for when the capture cannot install. The web chat runs
* the `deepseek-chat` model by default (switchable to deepseek-reasoner).
*
* All page interactions are best-effort and selector-defensive: failures
* produce readable errors (never crashes) and the caller decides how to
* degrade.
*/
const DEFAULT_TIMEOUT_MS = 18e4;
/**
* Injected before any page script: tee the chat/completion XHR stream into
* `window.__wcStream`. The DeepSeek web app reads its reply through an
* XMLHttpRequest (POST /api/v0/chat/completion, responseType "text", SSE
* body), so wrapping XHR `progress` events captures the raw `event:`/`data:`
* stream exactly as the page receives it — no PoW, no auth, no selectors.
* The function must stay self-contained (playwright serializes its source).
*/
function streamCaptureInit() {
	const w = window;
	if (w.__wcCaptureInstalled === true) return;
	w.__wcCaptureInstalled = true;
	w.__wcStream = {
		text: "",
		done: false,
		started: false,
		status: 0,
		error: ""
	};
	const X = w.XMLHttpRequest;
	const origOpen = X.prototype.open;
	const origSend = X.prototype.send;
	X.prototype.open = function(method, url, ...rest) {
		this.__wcIsChat = typeof url === "string" && url.includes("/chat/completion");
		return origOpen.call(this, method, url, ...rest);
	};
	X.prototype.send = function(...args) {
		if (this.__wcIsChat === true) {
			let lastLen = 0;
			this.addEventListener("progress", () => {
				const stream = w.__wcStream;
				if (stream === void 0) return;
				const text = this.responseText ?? "";
				if (text.length > lastLen) {
					stream.text += text.slice(lastLen);
					lastLen = text.length;
				}
				stream.started = true;
			});
			this.addEventListener("loadend", () => {
				const stream = w.__wcStream;
				if (stream === void 0) return;
				stream.done = true;
				stream.status = this.status;
				if (this.status >= 400) stream.error = `HTTP ${this.status}`;
			});
		}
		return origSend.apply(this, args);
	};
	const origFetch = w.fetch.bind(w);
	w.fetch = function(input, init) {
		const url = typeof input === "string" ? input : input?.url ?? String(input);
		const isChat = typeof url === "string" && url.includes("/chat/completion");
		return origFetch(input, init).then((response) => {
			if (!isChat || response === null || response === void 0) return response;
			const body = response.body;
			if (body === null || body === void 0 || typeof body.tee !== "function") return response;
			try {
				const [pageStream, captureStream] = body.tee();
				const decoder = new w.TextDecoder();
				const reader = captureStream.getReader();
				(async () => {
					try {
						for (;;) {
							const { done, value } = await reader.read();
							if (done) break;
							const stream = w.__wcStream;
							if (stream !== void 0) {
								stream.text += decoder.decode(value, { stream: true });
								stream.started = true;
							}
						}
						const stream = w.__wcStream;
						if (stream !== void 0) {
							stream.text += decoder.decode();
							stream.done = true;
							stream.status = response.status;
							if (response.status >= 400) stream.error = `HTTP ${response.status}`;
						}
					} catch {}
				})();
				return new w.Response(pageStream, {
					status: response.status,
					statusText: response.statusText,
					headers: response.headers
				});
			} catch {
				return response;
			}
		});
	};
}
/**
* DeepSeek citation numbering. The web numbers the *sources* (search results)
* 1..M, not the `[reference:N]` markers. Each `[reference:N]` marker is paired
* with a `references` op `{id,type}`:
*   - `TOOL_OPEN`  → a specific opened page whose `result.url` matches one of
*                    the search results; the citation number is that result's
*                    1-based position in the search-results list.
*   - `TOOL_SEARCH` → the search step itself, rendered by the web as a search
*                    icon (no number) rather than a citation.
* This is resolved inside `parseStreamReply`, which holds the search-results
* list and the opened-page id→url map.
*/
/**
* Defensive clean-up of the DeepSeek search-agent trace tokens. The parser
* already routes `DEEP_SEARCH` (conversation_mode) and `FINISHED` (status)
* events away from content, so this normally runs as a no-op; it exists for
* the DOM-scrape fallback and any residual markers.
*/
function stripSearchTrace(text) {
	return text.replace(/DEEP_SEARCH/g, "").replace(/FINISHED+/g, "\n\n").replace(/\n{3,}/g, "\n\n").trim();
}
/** True when a fragment type is the R1 reasoning (THINK / THINKING). */
function isThinkingType(type) {
	return typeof type === "string" && type.toUpperCase().includes("THINK");
}
/**
* Parse the accumulated `/api/v0/chat/completion` SSE body into reply text.
* The stream is `event:` / `data:` lines; each `data:` payload is JSON. The
* protocol distinguishes the R1 reasoning fragment (type `THINK`) from the
* answer fragment (type `RESPONSE`), and carries search steps as `TOOL_SEARCH`
* / `TOOL_OPEN` fragments:
*   - {"v":{"response":{"fragments":[{"type":"THINK","content":"…"}]}}}
*     a snapshot carrying the fragment list and their types.
*   - {"p":"response/fragments","o":"APPEND","v":[{"type":"RESPONSE",…}]}
*     appends a NEW fragment (reasoning / search / answer); `-1/content`
*     deltas after this belong to that new fragment.
*   - {"p":"response/fragments/-1/content","o":"APPEND","v":"是一座"} — appends
*     a text delta to the CURRENT fragment's content.
*   - {"p":"response/fragments/-1/results","o":"SET","v":[…]} — search results
*     for a TOOL_SEARCH step (rendered as "搜索到 N 个网页").
*   - {"v":"将"} — a bare delta continuing the current fragment; a bare
*     `{"v":[{p:"content",o:"APPEND",v:"[reference:N]"},…]}` carries citation
*     markers.
*   - {"p":"response/status","o":"SET","v":"FINISHED"} — generation complete.
*/
function parseStreamReply(raw) {
	let body = "";
	let thinking = "";
	let finished = false;
	let currentType = "RESPONSE";
	const searchResults = [];
	const openById = /* @__PURE__ */ new Map();
	let urlToIndex;
	const buildUrlIndex = () => {
		if (urlToIndex === void 0) {
			urlToIndex = /* @__PURE__ */ new Map();
			searchResults.forEach((url, i) => {
				if (url !== "" && !urlToIndex.has(url)) urlToIndex.set(url, i);
			});
		}
		return urlToIndex;
	};
	const resolveCitations = (text, refs) => {
		if (!Array.isArray(refs) || refs.length === 0) return text;
		let i = 0;
		return text.replace(/\[reference:\d+\]/g, () => {
			const ref = refs[i];
			i++;
			if (typeof ref !== "object" || ref === null) return "";
			if (ref["type"] !== "TOOL_OPEN") return "";
			const id = ref["id"];
			const url = typeof id === "number" ? openById.get(id) : void 0;
			if (url === void 0) return "";
			const idx = buildUrlIndex().get(url);
			return idx === void 0 ? "" : `[citation:${idx + 1}]`;
		});
	};
	const appendContent = (text) => {
		if (isThinkingType(currentType)) thinking += text;
		else body += text;
	};
	const appendFragments = (fragments) => {
		const opened = [];
		for (const frag of fragments) {
			if (typeof frag !== "object" || frag === null) continue;
			const f = frag;
			const type = f["type"];
			if (typeof type === "string") currentType = type;
			const content = f["content"];
			if (typeof content === "string" && content !== "") {
				if (isThinkingType(type)) thinking += content;
				else if (type === "RESPONSE" || type === "TEXT") body += content;
			}
			if (type === "TOOL_OPEN") {
				const result = f["result"];
				const title = result?.["title"];
				if (typeof title === "string" && title !== "") opened.push(title);
				const id = f["id"];
				const url = result?.["url"];
				if (typeof id === "number" && typeof url === "string" && url !== "") openById.set(id, url);
			}
		}
		if (opened.length > 0) thinking += `\n\n浏览 ${opened.length} 个页面\n${opened.map((t) => `- ${t}`).join("\n")}\n\n`;
	};
	const applyBatchOps = (ops) => {
		let contentText = "";
		let hasContent = false;
		let refs = null;
		const fragmentsList = [];
		for (const item of ops) {
			if (typeof item !== "object" || item === null) continue;
			const it = item;
			const ip = it["p"];
			const iop = it["o"];
			const iv = it["v"];
			if (ip === "content" && iop === "APPEND" && typeof iv === "string") {
				contentText += iv;
				hasContent = true;
			} else if (ip === "references" && Array.isArray(iv)) refs = iv;
			else if (ip === "fragments" && iop === "APPEND" && Array.isArray(iv)) fragmentsList.push(iv);
		}
		for (const fr of fragmentsList) appendFragments(fr);
		if (hasContent) if (isThinkingType(currentType)) thinking += contentText;
		else body += resolveCitations(contentText, refs);
	};
	for (const line of raw.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed.startsWith("data:")) continue;
		const payload = trimmed.slice(5).trim();
		if (payload === "") continue;
		let obj;
		try {
			obj = JSON.parse(payload);
		} catch {
			continue;
		}
		if (typeof obj !== "object" || obj === null) continue;
		const o = obj;
		const v = o["v"];
		if (typeof v === "object" && v !== null && !Array.isArray(v) && "response" in v) {
			const fragments = v["response"]?.["fragments"];
			if (Array.isArray(fragments)) {
				let newBody = "";
				let newThinking = "";
				for (const frag of fragments) {
					if (typeof frag !== "object" || frag === null) continue;
					const f = frag;
					const type = f["type"];
					if (typeof type === "string") currentType = type;
					const content = f["content"];
					if (typeof content !== "string" || content === "") continue;
					if (isThinkingType(type)) newThinking += content;
					else if (type === "RESPONSE" || type === "TEXT") newBody += content;
				}
				if (newBody !== "") body = newBody;
				if (newThinking !== "") thinking = newThinking;
			}
			continue;
		}
		const p = o["p"];
		const op = o["o"];
		if (p === "response/fragments" && op === "APPEND" && Array.isArray(v)) {
			appendFragments(v);
			continue;
		}
		if (typeof p === "string") {
			if (typeof v === "string" && p === "response/fragments/-1/content" && op !== "SET") appendContent(v);
			else if (op === "SET" && p === "response/fragments/-1/results" && Array.isArray(v)) {
				for (const r of v) if (typeof r === "object" && r !== null) {
					const url = r["url"];
					if (typeof url === "string" && url !== "") searchResults.push(url);
				}
				thinking += `\n\n搜索到 ${v.length} 个网页\n\n`;
			} else if (op === "SET" && p === "response/status" && v === "FINISHED") finished = true;
			else if (op === "BATCH" && Array.isArray(v)) applyBatchOps(v);
			continue;
		}
		if (Array.isArray(v)) {
			applyBatchOps(v);
			continue;
		}
		if (typeof v === "string") appendContent(v);
	}
	return {
		markdown: [thinking.trim() === "" ? "" : `<details><summary>思考过程</summary>\n\n${thinking.trim()}\n\n</details>`, body.trim()].filter((s) => s !== "").join("\n\n"),
		thinking,
		finished
	};
}
/** Order-preserving promise queue — the browser page handles one chat op at a time. */
var SerialQueue = class {
	tail = Promise.resolve();
	run(task) {
		const next = this.tail.then(task, task);
		this.tail = next.catch(() => void 0);
		return next;
	}
};
var DeepSeekWebEngine = class {
	store;
	config;
	profileDir;
	context;
	page;
	queue = new SerialQueue();
	state = "stopped";
	engineError;
	busy = false;
	lastError;
	lastErrorCode;
	launchedOnce = false;
	/** True while a headed one-time login window is open (auto-closes on login). */
	loginMode = false;
	/** Remembered login state — survives the auto-close so the panel stays "已登录". */
	loggedInOnce = false;
	/** Commanded toggle state (best-effort read-back overrides on status). */
	deepThink = false;
	search = false;
	constructor(store, config) {
		this.store = store;
		this.config = config;
		this.profileDir = join(config.dataDir, "browser-profile");
	}
	/** Coarse state for status snapshots. */
	getState() {
		return this.state;
	}
	getEngineError() {
		return this.engineError;
	}
	getBusy() {
		return this.busy;
	}
	getLastError() {
		return this.lastError;
	}
	getLastErrorCode() {
		return this.lastErrorCode;
	}
	/** Set the last error + its structured code together (keeps them in sync). */
	setLastError(message, code) {
		this.lastError = message;
		this.lastErrorCode = code;
	}
	setState(next, error) {
		this.state = next;
		this.engineError = error;
	}
	/** Resolve a browser launch descriptor (executable + args). */
	launchOptions() {
		const args = [];
		const proxy = this.config.proxy ?? "direct";
		if (proxy === "direct") args.push("--no-proxy-server");
		else if (proxy.startsWith("http")) args.push(`--proxy-server=${proxy}`);
		if (this.config.executablePath !== void 0) return {
			executablePath: this.config.executablePath,
			args
		};
		if (this.config.channel !== void 0 && this.config.channel !== "auto") return {
			channel: this.config.channel,
			args
		};
		return {
			...[
				{ channel: "chrome" },
				{ channel: "msedge" },
				{ channel: "chromium" },
				{ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" },
				{ executablePath: "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" },
				{ executablePath: "/usr/bin/google-chrome" },
				{ executablePath: "/usr/bin/google-chrome-stable" },
				{ executablePath: "/usr/bin/microsoft-edge" },
				{ executablePath: "/usr/bin/chromium" },
				{ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" },
				{ executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" }
			][0],
			args
		};
	}
	/**
	* Ensure the browser + chat.deepseek.com page exist. Launches the persistent
	* context on first call; subsequent calls reuse the page.
	*/
	/** True when the cached page/context are still connected (not closed by the user). */
	isPageAlive() {
		if (this.page === void 0 || this.context === void 0) return false;
		try {
			return !this.page.isClosed();
		} catch {
			return false;
		}
	}
	async ensureBrowser() {
		if (this.isPageAlive()) return this.page;
		if (this.state === "launching") {
			for (let attempt = 0; attempt < 100 && !this.isPageAlive(); attempt++) await new Promise((resolve) => setTimeout(resolve, 100));
			if (this.isPageAlive()) return this.page;
			throw new Error("浏览器启动超时");
		}
		if (this.page !== void 0 || this.context !== void 0) await this.disposeBrowser();
		this.setState("launching");
		try {
			mkdirSync(this.profileDir, {
				recursive: true,
				mode: 448
			});
			const options = this.launchOptions();
			const attemptOrder = this.config.executablePath !== void 0 || this.config.channel !== void 0 && this.config.channel !== "auto" ? [options] : this.launchOptionsCandidates();
			let lastError;
			for (const attempt of attemptOrder) try {
				this.context = await chromium.launchPersistentContext(this.profileDir, {
					...attempt,
					headless: this.loginMode ? false : this.config.headless ?? true,
					viewport: null,
					args: options.args
				});
				lastError = void 0;
				break;
			} catch (error) {
				lastError = error;
				await this.disposeBrowser();
			}
			if (lastError !== void 0) {
				this.setState("error", `无法启动浏览器（请检查 Chrome/Edge 是否已安装，或在插件设置中指定可执行文件路径）: ${String(lastError)}`);
				throw new Error(this.engineError);
			}
			const pages = this.context.pages();
			this.page = pages[0] ?? await this.context.newPage();
			this.page.setDefaultTimeout(15e3);
			await this.page.addInitScript(streamCaptureInit);
			await this.openDeepSeekPage();
			this.setState("ready");
			this.launchedOnce = true;
			return this.page;
		} catch (error) {
			if (this.state !== "error") this.setState("error", String(error));
			throw error;
		}
	}
	/** The candidate list used during auto-detection. */
	launchOptionsCandidates() {
		return [
			{ channel: "chrome" },
			{ channel: "msedge" },
			{ channel: "chromium" },
			{ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" },
			{ executablePath: "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" },
			{ executablePath: "/usr/bin/google-chrome" },
			{ executablePath: "/usr/bin/google-chrome-stable" },
			{ executablePath: "/usr/bin/microsoft-edge" },
			{ executablePath: "/usr/bin/chromium" },
			{ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" },
			{ executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" }
		].filter((candidate) => {
			if (candidate.channel !== void 0) return true;
			return candidate.executablePath !== void 0 && existsSync(candidate.executablePath);
		});
	}
	/** Navigate to the DeepSeek chat root. */
	async openDeepSeekPage() {
		if (this.page === void 0) throw new Error("浏览器尚未启动");
		const baseUrl = this.config.baseUrl ?? "https://chat.deepseek.com";
		try {
			await this.page.goto(baseUrl, {
				waitUntil: "domcontentloaded",
				timeout: 45e3
			});
			await this.page.waitForTimeout(2500);
		} catch (error) {
			this.setState("error", `无法打开 ${baseUrl}：${String(error)}`);
			throw new Error(this.engineError);
		}
	}
	/** True when the page shows the chat UI (not the login page). */
	async isLoggedIn() {
		if (!this.isPageAlive()) return null;
		try {
			const url = this.page.url();
			if (url.includes("/sign_in") || url.includes("/auth")) return false;
			return await this.page.locator("textarea").count().then((count) => count > 0).catch(() => false);
		} catch {
			return null;
		}
	}
	/**
	* Open a visible browser window for the one-time login. The window is forced
	* headed (login needs a user) and auto-closes as soon as the page reaches the
	* chat UI; normal chatting then runs headless on the persisted profile.
	*/
	async openLoginWindow() {
		try {
			if (this.page !== void 0 || this.context !== void 0) await this.disposeBrowser();
			this.loginMode = true;
			await this.ensureBrowser();
			await this.page?.bringToFront();
			this.watchLoginAndClose();
			return { ok: true };
		} catch (error) {
			this.loginMode = false;
			return {
				ok: false,
				error: String(error)
			};
		}
	}
	/** Poll the login window and close it once the user has logged in. */
	async watchLoginAndClose() {
		for (let attempt = 0; attempt < 600; attempt++) {
			if (!this.loginMode) return;
			if (!this.isPageAlive()) {
				this.loginMode = false;
				return;
			}
			if (await this.isLoggedIn() === true) {
				this.loginMode = false;
				this.loggedInOnce = true;
				await this.disposeBrowser().catch(() => void 0);
				return;
			}
			await new Promise((resolve) => setTimeout(resolve, 1e3));
		}
	}
	/** Current page URL (for status/debug). */
	pageUrl() {
		if (!this.isPageAlive()) return void 0;
		try {
			return this.page?.url();
		} catch {
			return;
		}
	}
	/**
	* Best-effort read of the deep-think (R1) and search toggle state from the
	* page. The toggles are `div.ds-toggle-button` elements (NOT `<button>`)
	* carrying `aria-pressed` plus a `ds-toggle-button--selected` class when on;
	* the search toggle is labeled 智能搜索. Falls back to the last commanded
	* state when the page gives no clear signal.
	*/
	async readToggles() {
		if (!this.isPageAlive()) return {
			deepThink: this.deepThink,
			search: this.search
		};
		try {
			const pageState = await this.page.evaluate(() => {
				const read = (candidates) => {
					for (const el of Array.from(document.querySelectorAll("[aria-pressed]"))) {
						const label = `${el.textContent ?? ""} ${el.getAttribute("aria-label") ?? ""}`;
						if (!candidates.some((candidate) => label.includes(candidate))) continue;
						const pressed = el.getAttribute("aria-pressed");
						if (pressed === "true") return true;
						if (pressed === "false") return false;
						const cls = typeof el.className === "string" ? el.className : "";
						if (/ds-toggle-button--selected|--selected|active|checked/i.test(cls)) return true;
					}
				};
				return {
					deepThink: read([
						"深度思考",
						"DeepThink",
						"Deep Think",
						"R1"
					]),
					search: read([
						"智能搜索",
						"联网搜索",
						"搜索",
						"Search"
					])
				};
			});
			return {
				deepThink: pageState.deepThink ?? this.deepThink,
				search: pageState.search ?? this.search
			};
		} catch {
			return {
				deepThink: this.deepThink,
				search: this.search
			};
		}
	}
	/** Serialized page evaluation guarded against a dead page. */
	async evalPage(fn) {
		if (this.page === void 0) throw new Error("浏览器尚未启动");
		return this.page.evaluate(fn);
	}
	/**
	* In-page scraper: returns the ordered rendered messages currently in the
	* DOM. Uses the virtual-list item keys as message boundaries and the
	* assistant-main-content class to split roles. Fallback only — the primary
	* reply source is the teed SSE stream.
	*/
	async scrapeConversation() {
		if (this.page === void 0) return [];
		return await this.page.evaluate(() => {
			const extract = (element) => {
				const clone = element.cloneNode(true);
				for (const junk of clone.querySelectorAll(".ds-markdown-code-copy-button, button, svg, [class*=\"copy\"]")) junk.remove();
				return {
					markdown: clone.innerHTML,
					text: clone.innerText
				};
			};
			const out = [];
			const items = document.querySelectorAll("[data-virtual-list-item-key]");
			for (const item of Array.from(items)) {
				const assistant = item.querySelector(".ds-assistant-message-main-content");
				if (assistant !== null) {
					const parts = [];
					const think = item.querySelector(".ds-think-content");
					if (think !== null) parts.push({
						kind: "think",
						...extract(think)
					});
					const body = assistant.classList.contains("ds-markdown") ? assistant : assistant.querySelector(".ds-markdown");
					if (body !== null) parts.push({
						kind: "body",
						...extract(body)
					});
					if (parts.length > 0) out.push({
						role: "assistant",
						parts
					});
				} else {
					const clone = item.cloneNode(true);
					for (const junk of clone.querySelectorAll("button, svg, [class*=\"copy\"]")) junk.remove();
					const text = (clone.innerText ?? "").trim();
					if (text !== "") out.push({
						role: "user",
						parts: [{
							kind: "body",
							markdown: "",
							text
						}]
					});
				}
			}
			return out;
		});
	}
	/** Convert scraped DOM messages into transcript messages (markdown content). */
	scrapedToMessages(scraped) {
		return scraped.map((message) => {
			if (message.role === "user") {
				const text = message.parts.map((part) => part.text).join("\n\n").trim();
				return {
					id: randomUUID(),
					role: "user",
					content: text === "" ? "（无内容）" : text,
					ts: Date.now()
				};
			}
			const think = message.parts.filter((part) => part.kind === "think").map((part) => part.text).join("\n\n").trim();
			const bodyHtml = message.parts.find((part) => part.kind === "body")?.markdown ?? "";
			const bodyMd = bodyHtml === "" ? "" : serializeToMarkdown(parseMarkup(bodyHtml));
			const thinkMd = think === "" ? "" : `<details><summary>思考过程</summary>\n\n${think}\n\n</details>`;
			return {
				id: randomUUID(),
				role: "assistant",
				content: [thinkMd, bodyMd].filter(Boolean).join("\n\n"),
				ts: Date.now()
			};
		});
	}
	/**
	* Scrape the DeepSeek sidebar conversation titles (best effort). The web
	* conversation list has no stable contract, so several candidate selectors
	* are probed and short non-menu texts are returned.
	*/
	async listWebConversations() {
		if (this.page === void 0) return [];
		return (await this.page.evaluate(() => {
			const found = /* @__PURE__ */ new Set();
			for (const selector of [
				"[class*=\"conversation\"]",
				"[class*=\"chat-item\"]",
				"[class*=\"session-item\"]",
				"nav a",
				"aside a",
				"[class*=\"sidebar\"] a"
			]) for (const el of Array.from(document.querySelectorAll(selector))) {
				const text = (el.textContent ?? "").trim().replace(/\s+/g, " ");
				if (text.length >= 1 && text.length <= 80 && !/^(新对话|New chat|删除|重命名|清空|设置|登出)/i.test(text)) found.add(text);
			}
			return Array.from(found).slice(0, 50);
		}).catch(() => [])).map((title) => ({ title }));
	}
	/** Click a sidebar conversation whose text contains the given title. */
	async clickConversationByTitle(title) {
		if (this.page === void 0) return false;
		for (const selector of [
			"[class*=\"conversation\"]",
			"[class*=\"chat-item\"]",
			"[class*=\"session-item\"]",
			"nav a",
			"aside a"
		]) {
			const locator = this.page.locator(selector).filter({ hasText: title }).first();
			if (await locator.count().catch(() => 0) > 0) {
				await locator.click({ timeout: 5e3 }).catch(() => void 0);
				return true;
			}
		}
		return false;
	}
	/**
	* Recover a web conversation into the local transcript store: open it in the
	* sidebar, scrape its history, and import it (idempotent by title).
	*/
	async recoverWebConversation(title) {
		if (this.page === void 0) try {
			await this.ensureBrowser();
		} catch (error) {
			return {
				ok: false,
				error: String(error)
			};
		}
		if (await this.isLoggedIn() !== true) return {
			ok: false,
			error: "尚未登录 DeepSeek 网页端"
		};
		try {
			if (!await this.clickConversationByTitle(title)) return {
				ok: false,
				error: `未在网页端找到会话「${title}」`
			};
			await this.page.waitForTimeout(1500);
			const scraped = await this.scrapeConversation();
			if (scraped.length === 0) return {
				ok: false,
				error: "读取网页会话历史失败（页面可能已改版）"
			};
			const messages = this.scrapedToMessages(scraped);
			const model = this.deepThink ? "deepseek-reasoner" : "deepseek-chat";
			const result = this.store.importTranscript({
				title,
				model,
				messages
			});
			return {
				ok: true,
				chatId: result.chat.id,
				title: result.chat.title,
				created: result.created
			};
		} catch (error) {
			return {
				ok: false,
				error: String(error)
			};
		}
	}
	/** Detect whether the page is currently generating (stop affordance visible). */
	async isGenerating() {
		if (this.page === void 0) return false;
		try {
			for (const selector of [
				"button[aria-label*=\"停止\"]",
				"[aria-label*=\"stop generating\" i]",
				"button:has-text(\"停止生成\")",
				"button:has-text(\"Stop generating\")"
			]) if (await this.page.locator(selector).count().catch(() => 0) > 0) return true;
			return false;
		} catch {
			return false;
		}
	}
	/** Click the stop-generation affordance, best effort. */
	async stop() {
		await this.queue.run(async () => {
			if (this.page === void 0) return;
			for (const selector of [
				"button[aria-label*=\"停止\"]",
				"[aria-label*=\"stop generating\" i]",
				"button:has-text(\"停止生成\")",
				"button:has-text(\"Stop generating\")"
			]) {
				const locator = this.page.locator(selector).first();
				if (await locator.count().catch(() => 0) > 0) {
					await locator.click({ timeout: 5e3 }).catch(() => void 0);
					return;
				}
			}
		});
	}
	/** Find the composer textarea (defensive selector list). */
	async composerLocator() {
		for (const selector of [
			"#chat-input",
			"textarea[placeholder*=\"给 DeepSeek\"]",
			"textarea[placeholder*=\"发送消息\"]",
			"textarea[placeholder*=\"Send a message\"]",
			"textarea"
		]) {
			const locator = this.page.locator(selector).first();
			if (await locator.count().catch(() => 0) > 0) return locator;
		}
		return this.page.locator("textarea").first();
	}
	/**
	* Upload local image files into the composer through the page's (usually
	* hidden) file input. `setInputFiles` fires the input's change event, which
	* is how DeepSeek picks up attachments without clicking its native dialog.
	*/
	async attachImages(paths) {
		if (this.page === void 0) return {
			ok: false,
			error: "浏览器未启动"
		};
		if (paths.length === 0) return { ok: true };
		for (const selector of ["input[type=\"file\"][accept*=\"image\" i]", "input[type=\"file\"]"]) {
			const input = this.page.locator(selector).first();
			if (await input.count().catch(() => 0) === 0) continue;
			try {
				await input.setInputFiles(paths);
				await this.page.waitForTimeout(1e3);
				return { ok: true };
			} catch (error) {
				return {
					ok: false,
					error: `图片上传失败：${String(error)}`
				};
			}
		}
		return {
			ok: false,
			error: "未找到图片上传入口（页面可能已改版或当前会话不支持图片）"
		};
	}
	/**
	* Send a message through the real web page.
	* @param text - message text.
	* @param wait - when true (agent tools), resolve with the final reply after
	*   streaming completes; when false (GUI), resolve right after the message
	*   is submitted — the reply streams in the background into the transcript
	*   and the panel polls it live.
	*/
	send(text, wait = false, images) {
		return this.queue.run(() => this.sendImpl(text, wait, images));
	}
	async sendImpl(text, wait, images) {
		this.setLastError(void 0);
		if (this.page === void 0) try {
			await this.ensureBrowser();
		} catch (error) {
			const message = String(error);
			this.setLastError(message, "NETWORK");
			return {
				ok: false,
				error: message,
				code: "NETWORK"
			};
		}
		if (await this.isLoggedIn() !== true) {
			const message = "尚未登录 DeepSeek 网页端。请在插件面板点击「打开登录窗口」，在弹出的浏览器中完成登录后重试。";
			this.setLastError(message, "NEED_LOGIN");
			return {
				ok: false,
				error: message,
				code: "NEED_LOGIN"
			};
		}
		try {
			const chat = this.store.ensureActiveChat(this.deepThink ? "deepseek-reasoner" : "deepseek-chat");
			const userMessage = {
				id: randomUUID(),
				role: "user",
				content: text,
				ts: Date.now(),
				...images !== void 0 && images.length > 0 ? { attachments: images } : {}
			};
			this.store.appendMessage(chat.id, userMessage);
			if (chat.title === "新的对话") this.store.renameChat(chat.id, text.replace(/\s+/g, " ").slice(0, 40));
			const page = this.page;
			if (page === void 0) return {
				ok: false,
				error: "浏览器未启动"
			};
			const composer = await this.composerLocator();
			await composer.waitFor({
				state: "visible",
				timeout: 15e3
			}).catch(() => void 0);
			await composer.click({ timeout: 5e3 }).catch(() => void 0);
			await composer.fill(text, { timeout: 1e4 }).catch(async () => {
				await composer.type(text, { delay: 5 });
			});
			if (images !== void 0 && images.length > 0) {
				const attach = await this.attachImages(images);
				if (!attach.ok) {
					const message = attach.error ?? "图片上传失败";
					this.setLastError(message, "NETWORK");
					return {
						ok: false,
						error: message,
						code: "NETWORK"
					};
				}
			}
			await page.evaluate(() => {
				const w = window;
				w.__wcStream = {
					text: "",
					done: false,
					started: false,
					status: 0,
					error: ""
				};
			}).catch(() => void 0);
			await page.keyboard.press("Enter");
			const assistantId = randomUUID();
			if (!wait) {
				this.streamReply(chat.id, assistantId);
				return {
					ok: true,
					chatId: chat.id
				};
			}
			return await this.streamReply(chat.id, assistantId);
		} catch (error) {
			const message = `发送失败：${String(error)}`;
			this.setLastError(message);
			return {
				ok: false,
				error: message
			};
		}
	}
	/**
	* Background reply loop. Primary source is the teed SSE stream (raw model
	* markdown, no selectors); if the capture never installs, falls back to
	* scraping the rendered DOM. Writes the growing reply into the transcript
	* until the stream reports done/FINISHED or the timeout hits.
	*/
	async streamReply(chatId, assistantId) {
		if (this.page === void 0) return {
			ok: false,
			error: "浏览器未启动"
		};
		this.busy = true;
		const started = Date.now();
		const timeout = this.config.replyTimeoutMs ?? DEFAULT_TIMEOUT_MS;
		let replyMarkdown = "";
		let replyError;
		let replyCode;
		let domStable = 0;
		let lastDom = "";
		const readCapture = async () => {
			if (this.page === void 0) return null;
			return this.page.evaluate(() => {
				return window.__wcStream ?? null;
			}).catch(() => null);
		};
		const domSnapshot = async () => {
			const assistant = [...await this.scrapeConversation()].reverse().find((message) => message.role === "assistant");
			if (assistant === void 0) return { markdown: "" };
			const think = stripSearchTrace(assistant.parts.filter((part) => part.kind === "think").map((part) => part.text).join("\n\n")).trim();
			const bodyHtml = assistant.parts.find((part) => part.kind === "body")?.markdown ?? "";
			const bodyMd = bodyHtml === "" ? "" : stripSearchTrace(serializeToMarkdown(parseMarkup(bodyHtml)));
			return { markdown: [think === "" ? "" : `<details><summary>思考过程</summary>\n\n${think}\n\n</details>`, bodyMd].filter(Boolean).join("\n\n") };
		};
		try {
			await this.page.waitForTimeout(700);
			let captureSeen = false;
			let captureCompleted = false;
			while (Date.now() - started < timeout) {
				const capture = await readCapture();
				if (capture !== null && capture.started) {
					captureSeen = true;
					const parsed = parseStreamReply(capture.text);
					if (parsed.markdown !== "") {
						replyMarkdown = parsed.markdown;
						this.store.upsertMessage(chatId, {
							id: assistantId,
							role: "assistant",
							content: replyMarkdown,
							ts: Date.now(),
							streaming: !(capture.done || parsed.finished)
						});
					}
					if (capture.done || parsed.finished) {
						captureCompleted = true;
						break;
					}
					if (capture.error !== "") {
						replyError = capture.error;
						replyCode = "NETWORK";
						break;
					}
				} else {
					const dom = await domSnapshot();
					if (dom.markdown !== "") {
						if (dom.markdown !== lastDom) {
							lastDom = dom.markdown;
							domStable = 0;
							replyMarkdown = dom.markdown;
						} else domStable += 1;
						this.store.upsertMessage(chatId, {
							id: assistantId,
							role: "assistant",
							content: replyMarkdown,
							ts: Date.now(),
							streaming: true
						});
					}
					if (replyMarkdown !== "" && domStable >= 3) break;
				}
				await this.page.waitForTimeout(350);
			}
			if (replyMarkdown === "" && replyCode === void 0) if (captureSeen && captureCompleted) {
				replyError = "页面协议疑似改版：已捕获到回复流但无法解析出内容，请升级 dsh-webchat 插件";
				replyCode = "PAGE_CHANGED";
			} else {
				replyError = "等待回复超时（未捕获到网页回复流；可能未登录或页面结构已变化）";
				replyCode = "TIMEOUT";
			}
			else if (replyCode === void 0 && Date.now() - started >= timeout) {
				replyError = "生成超时，已返回部分内容";
				replyCode = "TIMEOUT";
			}
			this.store.upsertMessage(chatId, {
				id: assistantId,
				role: "assistant",
				content: replyMarkdown,
				ts: Date.now(),
				streaming: false,
				error: replyError
			});
			this.store.setStreaming(chatId, false);
			if (replyError !== void 0) this.setLastError(replyError, replyCode);
			return {
				ok: replyError === void 0,
				chatId,
				reply: replyMarkdown,
				error: replyError,
				code: replyCode
			};
		} catch (error) {
			const message = `生成过程中断：${String(error)}`;
			this.setLastError(message);
			this.store.upsertMessage(chatId, {
				id: assistantId,
				role: "assistant",
				content: replyMarkdown,
				ts: Date.now(),
				streaming: false,
				error: message
			});
			this.store.setStreaming(chatId, false);
			return {
				ok: false,
				chatId,
				reply: replyMarkdown,
				error: message
			};
		} finally {
			this.busy = false;
		}
	}
	/** Start a new chat on the web page (best effort) + a fresh local transcript. */
	async newChat() {
		if (this.busy) return {
			ok: false,
			error: "正在生成回复，请先停止或等待完成"
		};
		return this.queue.run(async () => {
			try {
				await this.ensureBrowser();
				const chat = this.store.createChat(this.deepThink ? "deepseek-reasoner" : "deepseek-chat");
				if (this.page !== void 0) {
					const clickSelectors = [
						"button:has-text(\"新对话\")",
						"button:has-text(\"New chat\")",
						"[class*=\"newChat\"]"
					];
					let clicked = false;
					for (const selector of clickSelectors) {
						const locator = this.page.locator(selector).first();
						if (await locator.count().catch(() => 0) > 0) {
							await locator.click({ timeout: 5e3 }).catch(() => void 0);
							clicked = true;
							break;
						}
					}
					if (!clicked) await this.openDeepSeekPage();
					await this.page.waitForTimeout(1500);
				}
				return {
					ok: true,
					chatId: chat.id
				};
			} catch (error) {
				return {
					ok: false,
					error: String(error)
				};
			}
		});
	}
	/**
	* Click a toggle on the page by label candidates (best effort — the DeepSeek
	* web UI has no stable contract, so a miss is not an error). The toggles are
	* `div.ds-toggle-button` elements (not `<button>`), so those selectors come
	* first; `<button>` variants remain as fallbacks for older page versions.
	* @returns true when a candidate was clicked.
	*/
	async clickToggle(labels) {
		if (!this.isPageAlive()) return false;
		const selectors = [];
		for (const label of labels) selectors.push(`div.ds-toggle-button:has-text("${label}")`, `[aria-pressed]:has-text("${label}")`, `button:has-text("${label}")`, `[aria-label*="${label}"]`);
		for (const selector of selectors) {
			const locator = this.page.locator(selector).first();
			if (await locator.count().catch(() => 0) > 0) {
				await locator.click({ timeout: 5e3 }).catch(() => void 0);
				return true;
			}
		}
		return false;
	}
	/** Toggle deep-think (R1) mode on the web page. */
	async setDeepThink(enabled) {
		if (this.busy) return {
			ok: false,
			error: "正在生成回复，请先等待完成"
		};
		return this.queue.run(async () => {
			try {
				await this.ensureBrowser();
				if ((await this.readToggles()).deepThink !== enabled) await this.clickToggle([
					"深度思考",
					"DeepThink",
					"Deep Think"
				]);
				this.deepThink = enabled;
				return { ok: true };
			} catch (error) {
				return {
					ok: false,
					error: String(error)
				};
			}
		});
	}
	/** Toggle internet search on the web page (web label: 智能搜索). */
	async setSearch(enabled) {
		if (this.busy) return {
			ok: false,
			error: "正在生成回复，请先等待完成"
		};
		return this.queue.run(async () => {
			try {
				await this.ensureBrowser();
				if ((await this.readToggles()).search !== enabled) await this.clickToggle([
					"智能搜索",
					"联网搜索",
					"Search"
				]);
				this.search = enabled;
				return { ok: true };
			} catch (error) {
				return {
					ok: false,
					error: String(error)
				};
			}
		});
	}
	/** Close the browser (releases the profile lock). */
	async disposeBrowser() {
		try {
			await this.context?.close();
		} catch {}
		this.context = void 0;
		this.page = void 0;
		this.loginMode = false;
		if (this.state !== "error") this.setState("stopped");
	}
	/** Engine snapshot for status routes and agent tools. */
	async status() {
		if (this.state === "ready" && !this.isPageAlive()) await this.ensureBrowser().catch(() => void 0);
		let loggedIn = await this.isLoggedIn();
		if (loggedIn === true) this.loggedInOnce = true;
		else if (loggedIn === false) this.loggedInOnce = false;
		else if (loggedIn === null && this.loggedInOnce) loggedIn = true;
		const toggles = await this.readToggles();
		this.deepThink = toggles.deepThink;
		this.search = toggles.search;
		return {
			engine: this.state,
			engineError: this.engineError,
			loggedIn,
			pageUrl: this.pageUrl(),
			deepThink: this.deepThink,
			search: this.search,
			busy: this.busy,
			lastError: this.lastError,
			lastErrorCode: this.lastErrorCode
		};
	}
};
/**
* Minimal HTML fragment parser used to round-trip scraped `.ds-markdown`
* innerHTML through htmlToMarkdown (the in-page evaluate returns HTML
* strings; the converter consumes a light DOM-shaped object graph).
*/
function parseMarkup(html) {
	return new MarkupParser(html).parse();
}
/** Tiny HTML tokenizer → light DOM graph (sufficient for DeepSeek's markdown HTML). */
var MarkupParser = class {
	tokens;
	index = 0;
	constructor(html) {
		this.tokens = html.split(/(<[^>]+>)/).filter((token) => token !== "");
	}
	parse() {
		return this.parseChildren(void 0);
	}
	parseChildren(parent) {
		const node = {
			nodeType: 1,
			children: [],
			attributes: {},
			parent
		};
		while (this.index < this.tokens.length) {
			const token = this.tokens[this.index];
			if (!token.startsWith("<")) {
				node.children.push({
					nodeType: 3,
					textContent: token,
					children: [],
					attributes: {},
					parent: node
				});
				this.index++;
				continue;
			}
			const close = /^<\/([a-zA-Z0-9]+)>$/.exec(token);
			if (close !== null) {
				this.index++;
				if (close[1].toLowerCase() === (node.tagName ?? "").toLowerCase()) return node;
				continue;
			}
			const open = /^<([a-zA-Z0-9]+)((?:\s+[a-zA-Z0-9-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]*))?)*)\s*(\/?)>$/.exec(token);
			if (open === null) {
				this.index++;
				continue;
			}
			const [, rawTag, attrsRaw] = open;
			const tag = rawTag.toLowerCase();
			const attributes = {};
			if (attrsRaw !== void 0) {
				const attrRe = /([a-zA-Z0-9-]+)(?:=("[^"]*"|'[^']*'|[^\s>]*))?/g;
				let match;
				while ((match = attrRe.exec(attrsRaw)) !== null) {
					const value = match[2] === void 0 ? void 0 : match[2].replace(/^["']|["']$/g, "");
					attributes[match[1]] = value;
				}
			}
			this.index++;
			const element = {
				tagName: tag,
				nodeType: 1,
				children: [],
				attributes,
				parent
			};
			if (!open[3].endsWith("/")) {
				const child = this.parseChildren(element);
				for (const grandchild of child.children) element.children.push(grandchild);
			}
			node.children.push(element);
		}
		return node;
	}
};
//#endregion
//#region src/transfer.ts
/**
* Harness-mode transfer: turn a web-chat transcript into development context.
*
* This is the "Continue in Codex" / ChatGPT-mode analog, and like Codex it is
* a CONTEXT HANDOFF rather than a raw replay: the exploration-phase web
* conversation is distilled (via the harness LLM) into an executable task
* brief — the execution-phase state representation the agent actually needs —
* and that brief seeds a fresh harness session. The raw transcript is kept as
* the fallback when distillation is unavailable.
*
* Two targets:
*  - new harness session — a COLD persisted session seeded with the distilled
*    brief (or raw transcript), so it shows up in the GUI list and resumes;
*  - workspace file — the raw transcript rendered to markdown in the target
*    project directory, so any agent can read it with file tools.
*
* Session creation writes directly through the session-persistence backend
* (`sessionPersistence.create` + `append`), NOT `ctx.sessions.create()`:
* the store's `create` produces a LIVE session owned by the calling fiber,
* which the GUI then refuses to resume ("cannot prepare … while it is live").
* A cold persisted session is exactly what the GUI's resume path expects.
*/
/** Role label used in rendered transcripts. */
const ROLE_LABEL = {
	user: "用户",
	assistant: "DeepSeek（网页端）"
};
/** Remove the collapsible R1 reasoning block(s) from reply markdown. */
function stripThinking(markdown) {
	return markdown.replace(/<details>\s*<summary>.*?<\/summary>[\s\S]*?<\/details>/g, "").replace(/\n{3,}/g, "\n\n").trim();
}
/** Render the message list of a transcript (no header) to markdown. */
function renderMessagesMarkdown(messages, options) {
	const excludeThinking = options?.excludeThinking ?? false;
	const lines = [];
	for (const message of messages) {
		if (message.role === "assistant" && message.streaming) continue;
		const content = (excludeThinking ? stripThinking(message.content) : message.content).trim();
		lines.push(`## ${ROLE_LABEL[message.role]}`);
		lines.push("");
		lines.push(content === "" ? "（无内容）" : content);
		if (message.attachments !== void 0 && message.attachments.length > 0) {
			lines.push("");
			lines.push(`> 📎 图片附件：${message.attachments.join("、")}`);
		}
		if (message.error !== void 0) {
			lines.push("");
			lines.push(`> ⚠️ 该条回复可能不完整：${message.error}`);
		}
		lines.push("");
	}
	return lines.join("\n").trim();
}
/** Render one transcript to markdown for harness consumption. */
function renderTranscriptMarkdown(transcript, options) {
	const lines = [];
	lines.push(`# 网页端对话记录：${transcript.title}`);
	lines.push("");
	lines.push(`- 来源：DeepSeek 网页端（chat.deepseek.com）· 模型 ${transcript.model}`);
	lines.push(`- 开始时间：${new Date(transcript.createdAt).toLocaleString()}`);
	lines.push(`- 消息数：${transcript.messages.length}`);
	lines.push("");
	lines.push("> 以下内容由 dsh-webchat 插件从 DeepSeek 网页端会话导出。");
	lines.push("");
	const body = renderMessagesMarkdown(transcript.messages, options);
	if (body !== "") lines.push(body);
	return lines.join("\n").trim() + "\n";
}
/**
* Framing that turns the distilled brief into established context for the
* agent — the analog of Codex's "another model started to solve this problem
* and produced a summary; use it to build on the work already done".
*/
const HANDOFF_PREAMBLE = "这是一次从 DeepSeek 网页端会话（chat.deepseek.com）转来的上下文交接。下面的任务简报已把该对话提炼为可执行的任务上下文——把它当作既定目标与背景，直接在其基础上继续，不要复述。";
/**
* The distillation directive. Delivered as the final user message after the
* raw transcript so the model condenses the exploration phase into the
* execution-phase state representation. Mirrors Codex's handoff and DSH's
* compaction checkpoint structure, tuned for "web chat → coding task".
*/
const DISTILL_INSTRUCTION = [
	"You are distilling a web-chat conversation (a user exploring and planning with a DeepSeek web model) into an executable task brief for a coding agent that will resume this work in a FRESH session WITHOUT the raw conversation.",
	"",
	"Output EXACTLY the Markdown structure below — every section, in order, terse bullets, \"(none)\" for an empty section:",
	"",
	"## Objective",
	"- [the concrete goal/task to execute; quote the user's exact wording where it matters]",
	"",
	"## Established Context",
	"- [decisions, constraints, requirements, and facts already settled]",
	"",
	"## Current State",
	"- [what has been designed, decided, or produced so far]",
	"",
	"## Next Steps",
	"- [concrete ordered actions the coding agent should take]",
	"",
	"## Open Questions & Risks",
	"- [anything unresolved, uncertain, or risky]",
	"",
	"Rules:",
	"- Terse, concrete engineering prose. Preserve exact identifiers, paths, commands, error strings, code snippets, and numeric values.",
	"- Do not invent facts; mark uncertainty explicitly.",
	"- Do not mention this distillation request or the web-chat source.",
	"- Output only the brief."
].join("\n");
/** Default output-token cap for the final distillation brief. */
const DEFAULT_TRANSFER_MAX_TOKENS = 4096;
/** Default output-token cap for one chunk summary in the map phase. */
const DEFAULT_TRANSFER_CHUNK_TOKENS = 1024;
/** Character budget per chunk when splitting a long transcript for map-reduce. */
const CHUNK_CHAR_BUDGET = 12e3;
/** Pick a provider/model for the one-shot distillation call. */
async function resolveDistillTarget(llm, provider, model) {
	if (provider !== "" && model !== "") return {
		provider,
		model
	};
	const providers = llm.listProviders();
	if (providers.length === 0) return void 0;
	const baseProvider = provider !== "" ? provider : (providers.find((entry) => entry.id.toLowerCase().includes("deepseek")) ?? providers[0]).id;
	if (model !== "") return {
		provider: baseProvider,
		model
	};
	const models = await llm.listModels(baseProvider);
	const picked = models.find((entry) => entry.id.toLowerCase().includes("chat")) ?? models[0];
	return picked === void 0 ? void 0 : {
		provider: baseProvider,
		model: picked.id
	};
}
/**
* Split a transcript's messages into chunks of at most `budget` characters
* (sum of `message.content.length`), never splitting a single message: a
* message larger than the budget becomes its own (oversized) chunk. Streaming
* assistant messages are skipped (they were never completed).
*/
function chunkTranscript(transcript, budget = CHUNK_CHAR_BUDGET) {
	const chunks = [];
	let current = [];
	let size = 0;
	for (const message of transcript.messages) {
		if (message.role === "assistant" && message.streaming) continue;
		const messageSize = Math.max(1, message.content.length);
		if (current.length > 0 && size + messageSize > budget) {
			chunks.push(current);
			current = [];
			size = 0;
		}
		current.push(message);
		size += messageSize;
	}
	if (current.length > 0) chunks.push(current);
	return chunks;
}
/**
* The map-phase directive: condense one slice of a long conversation into
* dense notes a later synthesis step merges. Terse, factual, uncertainty-marked.
*/
const CHUNK_SUMMARY_INSTRUCTION = [
	"You are condensing one slice of a long web-chat conversation (a user exploring and planning with a DeepSeek web model) into dense notes that a later synthesis step will merge into a task brief.",
	"",
	"Preserve exactly, and do not invent:",
	"- decisions, constraints, requirements, and settled facts",
	"- exact identifiers, paths, commands, error strings, code snippets, and numeric values",
	"- anything still open, uncertain, or risky",
	"",
	"Output compact markdown notes. Mark uncertainty explicitly. Do not mention this summarization request or the source. Output only the notes."
].join("\n");
/** Run one LLM distillation call and return the assembled text (undefined on failure). */
async function runDistillCall(llm, target, instruction, maxTokens) {
	const assembler = new BlockAssembler();
	try {
		for await (const chunk of llm.stream({
			provider: target.provider,
			model: target.model,
			messages: [createUserMessage({
				content: [{
					type: "text",
					text: instruction
				}],
				source: {
					kind: "plugin",
					plugin: "webchat"
				}
			})],
			maxTokens,
			purpose: "compaction"
		})) assembler.push(chunk);
	} catch {
		return;
	}
	const finish = assembler.finish;
	if (finish.kind !== "stop" && finish.kind !== "max-tokens") return void 0;
	const text = assembler.blocks().filter((block) => block.type === "text").map((block) => block.text).join("\n").trim();
	return text === "" ? void 0 : text;
}
/**
* Distill a web transcript into an executable task brief via the harness LLM.
* Long transcripts are distilled with map-reduce: each chunk is summarized
* (map, capped at `chunkTokens`), then the summaries are merged into the final
* brief (reduce, capped at `maxTokens`). Short transcripts take a single shot.
* Returns undefined (so callers fall back to the raw transcript) when the LLM
* service, a provider/model, or a clean completion is unavailable.
*/
async function distillTranscriptToBrief(ctx, transcript, config) {
	const llm = ctx.get("llm");
	if (llm === void 0) return void 0;
	const target = await resolveDistillTarget(llm, config.provider, config.model).catch(() => void 0);
	if (target === void 0) return void 0;
	const maxTokens = config.maxTokens !== void 0 && config.maxTokens > 0 ? config.maxTokens : DEFAULT_TRANSFER_MAX_TOKENS;
	const chunkTokens = config.chunkTokens !== void 0 && config.chunkTokens > 0 ? config.chunkTokens : DEFAULT_TRANSFER_CHUNK_TOKENS;
	const chunks = chunkTranscript(transcript);
	let source;
	if (chunks.length <= 1) source = `${DISTILL_INSTRUCTION}\n\n--- 网页对话记录 ---\n\n${renderTranscriptMarkdown(transcript, { excludeThinking: true })}`;
	else {
		const summaries = [];
		for (let i = 0; i < chunks.length; i++) {
			const chunkMarkdown = renderMessagesMarkdown(chunks[i], { excludeThinking: true });
			const summary = await runDistillCall(llm, target, `${CHUNK_SUMMARY_INSTRUCTION}\n\n--- 片段 ${i + 1} / ${chunks.length} ---\n\n${chunkMarkdown}`, chunkTokens);
			summaries.push(summary ?? `（片段 ${i + 1} 摘要失败，截取原文）\n${chunkMarkdown.slice(0, 12e3)}`);
		}
		source = `${DISTILL_INSTRUCTION}\n\n--- 网页对话片段摘要（共 ${chunks.length} 段，已按段摘要） ---\n\n${summaries.join("\n\n---\n\n")}`;
	}
	const brief = await runDistillCall(llm, target, source, maxTokens);
	if (brief === void 0) return void 0;
	return {
		brief,
		provider: target.provider,
		model: target.model
	};
}
/** Build a user-message surface event carrying the handoff text at a given seq. */
function transcriptUserMessageEvent(markdown, seq) {
	return {
		type: "user/message",
		seq,
		time: Date.now(),
		surfaceOp: "append",
		data: {
			id: randomUUID(),
			role: "user",
			content: [{
				type: "text",
				text: markdown
			}],
			source: {
				kind: "plugin",
				plugin: "webchat"
			}
		}
	};
}
/** Build the seed user-message event carrying the handoff text (seq 0). */
function transcriptSeedEvent(markdown) {
	return transcriptUserMessageEvent(markdown, 0);
}
/**
* Sanitize a web-chat title into a safe single-line session title (the host
* session-title service strips control characters and collapses whitespace;
* mirror that lightly so a transferred title never overflows the fold).
*/
function normalizeSessionTitleText(text) {
	const cleaned = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").replace(/\s+/g, " ").trim();
	return Array.from(cleaned).slice(0, 80).join("");
}
/**
* Build the durable `session/title` event that pins the transferred session's
* display name to the web chat's title. The `session/title` type is a
* plugin-merged extension of `SessionEventMap` (from dsh-session-title), so it
* is not in this package's compiled `SessionEvent` union — cast through
* `unknown`. `source.kind: 'user'` pins the title against auto-regeneration.
*/
function transcriptTitleEvent(title, seq, time) {
	return {
		type: "session/title",
		seq,
		time,
		data: {
			title: normalizeSessionTitleText(title),
			messageSeqs: [],
			source: { kind: "user" }
		}
	};
}
/** Validate/normalize a workspace directory (must be absolute). */
function normalizeCwd(cwd) {
	const resolved = cwd === void 0 || cwd === "" ? process.cwd() : cwd;
	if (!resolved.startsWith("/") && !/^[A-Za-z]:[\\/]/.test(resolved)) throw new Error(`cwd 必须是绝对路径，收到: ${resolved}`);
	return resolved;
}
/** Access the optional workspace registry without a hard service dependency. */
function workspaceRegistryOf(ctx) {
	return ctx.get("workspaceRegistry");
}
/**
* Resolve the transfer destination. A `workspace.workspaceId` is validated
* BEFORE the session is persisted so an unknown id fails fast instead of
* leaving an orphan ungrouped session; `workspace.path` is realpath-canonicalized
* (an existing directory) and opportunistically resolved to a workspace; with
* no workspace the existing `cwd` behavior applies unchanged.
*/
async function resolveTransferTarget(ctx, input) {
	const registry = workspaceRegistryOf(ctx);
	const target = input.workspace;
	if (target?.workspaceId !== void 0 && target.workspaceId !== "") {
		if (registry === void 0) throw new Error(`无法归入工作区 ${target.workspaceId}：当前部署未挂载工作区服务`);
		const workspace = registry.get(target.workspaceId);
		if (workspace === void 0) throw new Error(`工作区 ${target.workspaceId} 不存在或已删除`);
		return {
			cwd: workspace.path,
			workspace
		};
	}
	if (target?.path !== void 0 && target.path !== "") {
		let cwd;
		try {
			cwd = await realpath(target.path);
		} catch {
			throw new Error(`工作区路径不可用（不存在或不是目录）：${target.path}`);
		}
		const workspace = registry === void 0 ? void 0 : await registry.resolveByPath(cwd).catch(() => void 0);
		return {
			cwd,
			workspace
		};
	}
	return { cwd: normalizeCwd(input.cwd) };
}
/**
* Continue an EXISTING harness session by appending the handoff as a fresh
* user message — the "same task, another web round" resume path. The session's
* stored log is loaded (which also durably closes any crash-orphaned turn) to
* learn the next contiguous seq and turn number, then an open turn is appended
* carrying the message; the resume loop closes the open turn and claims the
* message as pending input, exactly like a queued user prompt. No new session
* or header is created, so the target keeps its cwd/title/workspace.
*/
async function appendToExistingSession(ctx, sessionId, markdown, distilled) {
	const persistence = ctx.get("sessionPersistence");
	if (persistence === void 0) throw new Error("未找到会话持久化后端，无法延续已有会话");
	const id = SessionId(sessionId);
	const inspection = await persistence.load(id);
	let nextSeq = 0;
	let maxTurn = 0;
	for (const event of inspection.events) {
		if (event.seq >= nextSeq) nextSeq = event.seq + 1;
		const turn = event.data?.turn;
		if (typeof turn === "number" && turn > maxTurn) maxTurn = turn;
	}
	const turn = maxTurn + 1;
	const now = Date.now();
	const appended = [
		{
			type: "turn/start",
			seq: nextSeq,
			time: now,
			data: { turn }
		},
		{
			type: "step/start",
			seq: nextSeq + 1,
			time: now,
			data: {
				turn,
				step: 1
			}
		},
		transcriptUserMessageEvent(markdown, nextSeq + 2)
	];
	await persistence.append(id, appended);
	return {
		sessionId,
		distilled,
		attached: false
	};
}
/**
* Create a new COLD harness session seeded with a distilled task brief (or the
* raw transcript when the user chooses 'raw' / distillation is unavailable),
* written straight through the session-persistence backend so the GUI lists it
* and can resume it later (no live-store ownership). When `input.workspace`
* names a registered workspace, the session's cwd is set to that workspace's
* canonical path and the session is attached to the workspace's account, so
* the GUI groups it under that workspace instead of "ungrouped".
*
* `mode` is the user's explicit choice; when undefined the plugin config
* default (`transferDistill`) applies.
*/
async function transferToHarnessSession(ctx, input, config, mode) {
	const rawMarkdown = renderTranscriptMarkdown(input.transcript, { excludeThinking: true });
	const shouldDistill = mode === "distill" ? true : mode === "raw" ? false : config.distill;
	let seedMarkdown = `${HANDOFF_PREAMBLE}\n\n${rawMarkdown}`;
	let distilled = false;
	if (shouldDistill) {
		const result = await distillTranscriptToBrief(ctx, input.transcript, config);
		if (result !== void 0) {
			seedMarkdown = `${HANDOFF_PREAMBLE}\n\n${result.brief}\n\n> （已由 ${result.provider}/${result.model} 从网页对话蒸馏生成）`;
			distilled = true;
		}
	}
	if (input.targetSessionId !== void 0 && input.targetSessionId !== "") return appendToExistingSession(ctx, input.targetSessionId, seedMarkdown, distilled);
	const target = await resolveTransferTarget(ctx, input);
	const id = SessionId(`session-${randomUUID()}`);
	const header = {
		version: SESSION_FORMAT_VERSION,
		id,
		createdAt: Date.now(),
		cwd: target.cwd,
		delegationDepth: 0
	};
	const seedEvent = transcriptSeedEvent(seedMarkdown);
	const title = normalizeSessionTitleText(input.transcript.title);
	const events = [seedEvent];
	if (title !== "") events.push(transcriptTitleEvent(title, seedEvent.seq + 1, seedEvent.time));
	const persistence = ctx.get("sessionPersistence");
	if (persistence !== void 0) {
		await persistence.create(header);
		await persistence.append(id, events);
	} else ctx.sessions.create(id, {
		meta: { cwd: target.cwd },
		seed: events
	});
	let attached = false;
	if (target.workspace !== void 0) try {
		await target.workspace.attachSession(id);
		attached = true;
	} catch {
		attached = false;
	}
	const workspaceId = attached && target.workspace !== void 0 ? target.workspace.id : void 0;
	return {
		sessionId: id,
		distilled,
		attached,
		workspaceId
	};
}
/** Write the transcript markdown into the target directory; returns the path. */
function exportTranscriptFile(input) {
	const cwd = normalizeCwd(input.cwd);
	const filePath = join(cwd, `webchat-${input.transcript.title.replace(/[^\w\u4e00-\u9fa5-]+/g, "-").replace(/-+/g, "-").slice(0, 60) || "webchat"}-${input.transcript.id.slice(-6)}.md`);
	mkdirSync(cwd, { recursive: true });
	writeFileSync(filePath, renderTranscriptMarkdown(input.transcript), "utf8");
	return { filePath: basename(filePath) };
}
//#endregion
//#region src/routes.ts
/** Cap on JSON request bodies (chat ops are small). */
const MAX_JSON_BODY_BYTES = 64 * 1024;
/** Loopback-only trust fence (mirrors dsh-ssh). */
function isLoopbackRequest(req) {
	const host = req.headers.host ?? "";
	const address = req.socket.remoteAddress ?? "";
	return (host.startsWith("127.0.0.1") || host.startsWith("localhost") || host.startsWith("[::1]")) && (address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1" || address === void 0);
}
/** One JSON response. */
function writeJson(res, status, body) {
	const payload = JSON.stringify(body);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"referrer-policy": "no-referrer"
	});
	res.end(payload);
}
/** Read a JSON request body. */
async function readJsonBody(req) {
	const chunks = [];
	let size = 0;
	for await (const chunk of req) {
		const buffer = chunk;
		size += buffer.length;
		if (size > MAX_JSON_BODY_BYTES) return void 0;
		chunks.push(buffer);
	}
	try {
		const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
		return typeof parsed === "object" && parsed !== null ? parsed : void 0;
	} catch {
		return;
	}
}
function stringField(body, name) {
	const value = body?.[name];
	return typeof value === "string" && value !== "" ? value : void 0;
}
/** Build every /api/dsh-webchat route. */
function makeRoutes(deps) {
	const { ctx, engine, store, distill } = deps;
	const guard = (req, res) => {
		if (isLoopbackRequest(req)) return true;
		writeJson(res, 403, {
			ok: false,
			error: "loopback only"
		});
		return false;
	};
	const stateView = async () => {
		const status = await engine.status();
		return {
			ok: true,
			engine: status.engine,
			engineError: status.engineError,
			loggedIn: status.loggedIn,
			pageUrl: status.pageUrl,
			deepThink: status.deepThink,
			search: status.search,
			busy: status.busy,
			lastError: status.lastError,
			lastErrorCode: status.lastErrorCode,
			activeChatId: store.activeChat()?.id,
			chats: store.list()
		};
	};
	return [
		{
			kind: "exact",
			path: "/api/dsh-webchat/state",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				writeJson(res, 200, await stateView());
			}
		},
		{
			kind: "exact",
			path: "/api/dsh-webchat/open-login",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				const result = await engine.openLoginWindow();
				writeJson(res, result.ok ? 200 : 500, {
					ok: result.ok,
					error: result.error
				});
			}
		},
		{
			kind: "exact",
			path: "/api/dsh-webchat/close-browser",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				await engine.disposeBrowser();
				writeJson(res, 200, { ok: true });
			}
		},
		{
			kind: "exact",
			path: "/api/dsh-webchat/new-chat",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				const result = await engine.newChat();
				writeJson(res, result.ok ? 200 : 500, result);
			}
		},
		{
			kind: "exact",
			path: "/api/dsh-webchat/send",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				const body = await readJsonBody(req);
				const text = stringField(body, "text");
				if (text === void 0) {
					writeJson(res, 400, {
						ok: false,
						error: "缺少 text 字段"
					});
					return;
				}
				const images = Array.isArray(body?.["images"]) ? body["images"].filter((value) => typeof value === "string").map((value) => value) : void 0;
				const result = await engine.send(text, false, images);
				writeJson(res, result.ok ? 200 : 500, result);
			}
		},
		{
			kind: "exact",
			path: "/api/dsh-webchat/stop",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				await engine.stop();
				writeJson(res, 200, { ok: true });
			}
		},
		{
			kind: "exact",
			path: "/api/dsh-webchat/deep-think",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				const body = await readJsonBody(req);
				const enabled = typeof body?.["enabled"] === "boolean" ? body["enabled"] : void 0;
				if (enabled === void 0) {
					writeJson(res, 400, {
						ok: false,
						error: "缺少 enabled 字段"
					});
					return;
				}
				const result = await engine.setDeepThink(enabled);
				writeJson(res, result.ok ? 200 : 500, result);
			}
		},
		{
			kind: "exact",
			path: "/api/dsh-webchat/search",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				const body = await readJsonBody(req);
				const enabled = typeof body?.["enabled"] === "boolean" ? body["enabled"] : void 0;
				if (enabled === void 0) {
					writeJson(res, 400, {
						ok: false,
						error: "缺少 enabled 字段"
					});
					return;
				}
				const result = await engine.setSearch(enabled);
				writeJson(res, result.ok ? 200 : 500, result);
			}
		},
		{
			kind: "exact",
			path: "/api/dsh-webchat/transfer",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				const body = await readJsonBody(req);
				const chatId = stringField(body, "chatId") ?? store.activeChat()?.id;
				const cwd = stringField(body, "cwd");
				const workspaceId = stringField(body, "workspaceId");
				const targetSessionId = stringField(body, "targetSessionId");
				const mode = body?.["mode"] === "raw" ? "raw" : body?.["mode"] === "distill" ? "distill" : void 0;
				const transcript = chatId === void 0 ? void 0 : store.getChat(chatId);
				if (transcript === void 0) {
					writeJson(res, 404, {
						ok: false,
						error: "找不到该对话记录"
					});
					return;
				}
				try {
					const { sessionId, distilled, attached, workspaceId: attachedWorkspaceId } = await transferToHarnessSession(ctx, {
						transcript,
						cwd,
						workspace: workspaceId === void 0 ? void 0 : { workspaceId },
						targetSessionId
					}, distill, mode);
					writeJson(res, 200, {
						ok: true,
						sessionId,
						distilled,
						attached,
						continued: targetSessionId !== void 0,
						workspaceId: attachedWorkspaceId
					});
				} catch (error) {
					writeJson(res, 500, {
						ok: false,
						error: String(error)
					});
				}
			}
		},
		{
			kind: "exact",
			path: "/api/dsh-webchat/export",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				const body = await readJsonBody(req);
				const chatId = stringField(body, "chatId") ?? store.activeChat()?.id;
				const cwd = stringField(body, "cwd");
				const transcript = chatId === void 0 ? void 0 : store.getChat(chatId);
				if (transcript === void 0) {
					writeJson(res, 404, {
						ok: false,
						error: "找不到该对话记录"
					});
					return;
				}
				try {
					const { filePath } = exportTranscriptFile({
						transcript,
						cwd
					});
					writeJson(res, 200, {
						ok: true,
						filePath
					});
				} catch (error) {
					writeJson(res, 500, {
						ok: false,
						error: String(error)
					});
				}
			}
		},
		{
			kind: "exact",
			path: "/api/dsh-webchat/web-chats",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				const web = await engine.listWebConversations();
				const localTitles = new Set(store.titles());
				writeJson(res, 200, {
					ok: true,
					web,
					missing: web.filter((item) => !localTitles.has(item.title)).map((item) => item.title)
				});
			}
		},
		{
			kind: "exact",
			path: "/api/dsh-webchat/recover",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				const title = stringField(await readJsonBody(req), "title");
				if (title === void 0) {
					writeJson(res, 400, {
						ok: false,
						error: "缺少 title 字段"
					});
					return;
				}
				const result = await engine.recoverWebConversation(title);
				writeJson(res, result.ok ? 200 : 500, result);
			}
		},
		{
			kind: "exact",
			path: "/api/dsh-webchat/rename",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				const body = await readJsonBody(req);
				const chatId = stringField(body, "chatId");
				const title = stringField(body, "title");
				if (chatId === void 0 || title === void 0) {
					writeJson(res, 400, {
						ok: false,
						error: "缺少 chatId 或 title 字段"
					});
					return;
				}
				if (store.renameChat(chatId, title) === void 0) writeJson(res, 404, {
					ok: false,
					error: "找不到该对话记录"
				});
				else writeJson(res, 200, { ok: true });
			}
		},
		{
			kind: "exact",
			path: "/api/dsh-webchat/delete",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				const chatId = stringField(await readJsonBody(req), "chatId");
				if (chatId === void 0) {
					writeJson(res, 400, {
						ok: false,
						error: "缺少 chatId 字段"
					});
					return;
				}
				if (!store.deleteChat(chatId)) writeJson(res, 404, {
					ok: false,
					error: "找不到该对话记录"
				});
				else writeJson(res, 200, { ok: true });
			}
		},
		{
			kind: "exact",
			path: "/api/dsh-webchat/clear",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				writeJson(res, 200, {
					ok: true,
					count: store.clearAllChats()
				});
			}
		}
	];
}
//#endregion
//#region src/store.ts
/**
* Local transcript store. Chats are persisted as one JSON file under the
* plugin data dir (~/.dsh/dsh-webchat/transcripts.json by default) so web
* conversations survive restarts and can be transferred into harness mode
* at any time. Atomic writes (tmp + rename) keep a crash from corrupting
* history.
*/
/** Default plugin data directory (tests inject a sandbox root). */
function defaultDataDir() {
	return join(process.env.DSH_HOME ?? process.env.HOME ?? ".", ".dsh", "dsh-webchat");
}
/**
* JSON-file transcript store. All mutations are synchronous and persisted
* immediately (chats are small); the engine and routes use this single
* instance so GUI and agent tools always see the same history.
*/
var TranscriptStore = class {
	dataDir;
	file;
	chats;
	activeChatId;
	constructor(options = {}) {
		this.dataDir = options.dataDir ?? defaultDataDir();
		this.file = join(this.dataDir, "transcripts.json");
		const loaded = this.read();
		this.chats = loaded.chats;
		this.activeChatId = loaded.activeChatId;
		if (this.activeChatId !== void 0 && !this.chats.some((chat) => chat.id === this.activeChatId)) this.activeChatId = this.chats.at(-1)?.id;
	}
	read() {
		try {
			const parsed = JSON.parse(readFileSync(this.file, "utf8"));
			const chats = Array.isArray(parsed.chats) ? parsed.chats : [];
			return {
				version: 1,
				activeChatId: typeof parsed.activeChatId === "string" ? parsed.activeChatId : void 0,
				chats: chats.filter((chat) => typeof chat?.id === "string" && Array.isArray(chat.messages))
			};
		} catch {
			return {
				version: 1,
				chats: []
			};
		}
	}
	persist() {
		mkdirSync(this.dataDir, {
			recursive: true,
			mode: 448
		});
		const payload = {
			version: 1,
			activeChatId: this.activeChatId,
			chats: this.chats
		};
		const tmp = `${this.file}.tmp`;
		writeFileSync(tmp, JSON.stringify(payload, null, 2), { mode: 384 });
		renameSync(tmp, this.file);
	}
	/** Create a fresh chat and make it active. */
	createChat(model) {
		const now = Date.now();
		const chat = {
			id: `chat-${now.toString(36)}-${randomUUID().slice(0, 6)}`,
			title: "新的对话",
			createdAt: now,
			updatedAt: now,
			model,
			messages: [],
			streaming: false
		};
		this.chats.unshift(chat);
		this.activeChatId = chat.id;
		this.persist();
		return chat;
	}
	/** All chats, newest first. */
	list() {
		return [...this.chats];
	}
	/** Local transcript titles (for matching against the web sidebar). */
	titles() {
		return this.chats.map((chat) => chat.title);
	}
	/**
	* Import a recovered web conversation as a local transcript. Dedups by exact
	* title (web conversations with the same title map to the existing chat), so
	* re-syncing is idempotent. Returns the chat plus whether it was newly created.
	*/
	importTranscript(input) {
		const cleanTitle = input.title.trim().replace(/\s+/g, " ").slice(0, 80) || "新的对话";
		const existing = this.chats.find((chat) => chat.title === cleanTitle);
		if (existing !== void 0) {
			this.activeChatId = existing.id;
			return {
				chat: existing,
				created: false
			};
		}
		const now = Date.now();
		const chat = {
			id: `chat-${now.toString(36)}-${randomUUID().slice(0, 6)}`,
			title: cleanTitle,
			createdAt: now,
			updatedAt: now,
			model: input.model,
			messages: input.messages,
			streaming: false
		};
		this.chats.unshift(chat);
		this.activeChatId = chat.id;
		this.persist();
		return {
			chat,
			created: true
		};
	}
	/** The active chat, or undefined when none exists yet. */
	activeChat() {
		if (this.activeChatId === void 0) return void 0;
		return this.chats.find((chat) => chat.id === this.activeChatId);
	}
	/** Read one chat by id. */
	getChat(id) {
		return this.chats.find((chat) => chat.id === id);
	}
	/** Pick the active chat, creating one if none exists. */
	ensureActiveChat(model) {
		return this.activeChat() ?? this.createChat(model);
	}
	/** Set which chat is active. */
	setActiveChat(id) {
		if (!this.chats.some((chat) => chat.id === id)) return false;
		this.activeChatId = id;
		this.persist();
		return true;
	}
	/** Mutate the active (or named) chat and persist. */
	update(id, mutate) {
		const chat = this.chats.find((candidate) => candidate.id === id);
		if (chat === void 0) return void 0;
		mutate(chat);
		chat.updatedAt = Date.now();
		this.persist();
		return chat;
	}
	/** Append a message to a chat. */
	appendMessage(id, message) {
		return this.update(id, (chat) => {
			chat.messages.push(message);
			if (message.role === "assistant") chat.streaming = message.streaming ?? false;
		});
	}
	/** Replace (or insert) one message by id — used for streaming updates. */
	upsertMessage(id, message) {
		return this.update(id, (chat) => {
			const index = chat.messages.findIndex((candidate) => candidate.id === message.id);
			if (index >= 0) chat.messages[index] = message;
			else chat.messages.push(message);
			if (message.role === "assistant") chat.streaming = message.streaming ?? false;
		});
	}
	/** Mark the chat's streaming flag (assistant reply started/stopped). */
	setStreaming(id, streaming, model) {
		return this.update(id, (chat) => {
			chat.streaming = streaming;
			if (model !== void 0) chat.model = model;
		});
	}
	/** Rename a chat (used to pin a meaningful title after the first exchange). */
	renameChat(id, title) {
		const clean = title.trim().replace(/\s+/g, " ").slice(0, 80);
		if (clean === "") return void 0;
		return this.update(id, (chat) => {
			chat.title = clean;
		});
	}
	/** Delete one chat; a deleted active chat falls back to the newest remaining. */
	deleteChat(id) {
		const before = this.chats.length;
		this.chats = this.chats.filter((chat) => chat.id !== id);
		if (this.chats.length === before) return false;
		if (this.activeChatId === id) this.activeChatId = this.chats.at(0)?.id;
		this.persist();
		return true;
	}
	/** Delete every chat; returns the number removed. */
	clearAllChats() {
		const count = this.chats.length;
		if (count === 0) return 0;
		this.chats = [];
		this.activeChatId = void 0;
		this.persist();
		return count;
	}
};
//#endregion
//#region src/tools.ts
/** Actionable hint for a structured engine error code (surfaced to the agent). */
function errorCodeHint(code) {
	switch (code) {
		case "NEED_LOGIN": return "需要先登录：请在插件面板点击「打开登录窗口」完成 DeepSeek 网页登录。";
		case "PAGE_CHANGED": return "页面/协议疑似改版：请升级 dsh-webchat 插件。";
		case "TIMEOUT": return "生成超时：可稍后重试。";
		case "NETWORK": return "网络/浏览器错误：请检查网络或浏览器是否可用。";
		default: return "";
	}
}
/** One text content block (the only render shape these tools emit). */
function text(value) {
	return [{
		type: "text",
		text: value
	}];
}
/** Render the chat list compactly. */
function renderChats(store) {
	const chats = store.list();
	if (chats.length === 0) return "还没有任何网页端对话记录";
	return chats.map((chat) => {
		const messages = chat.messages.length;
		const last = chat.messages.at(-1);
		const preview = last === void 0 ? "" : ` · 最后: ${last.content.replace(/\s+/g, " ").slice(0, 60)}`;
		return `${chat.id} | ${chat.title} | ${chat.model} | ${messages} 条消息 | ${new Date(chat.updatedAt).toLocaleString()}${preview}`;
	}).join("\n");
}
/** The engine-status tool. */
function webChatStatusTool(engine, store, listWorkspaces) {
	return defineTool({
		name: "webchat_status",
		description: "Report the DeepSeek 网页端 (chat.deepseek.com) web-chat state: engine status, login state, active chat, stored transcripts, and the harness workspaces available as webchat_transfer targets. Triggers: webchat, deepseek 网页端, 网页聊天. Use before webchat_send to confirm login.",
		parameters: {},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: { report: {
					type: "string",
					required: true
				} }
			},
			render: (_args, value) => text(value.report ?? "")
		},
		async execute() {
			const status = await engine.status();
			const active = store.activeChat();
			const lines = [
				`engine: ${status.engine}${status.engineError !== void 0 ? ` (${status.engineError})` : ""}`,
				`loggedIn: ${String(status.loggedIn)}`,
				`pageUrl: ${status.pageUrl ?? "-"}`,
				`deepThink: ${String(status.deepThink)}`,
				`search: ${String(status.search)}`,
				`busy: ${String(status.busy)}`,
				`activeChat: ${active === void 0 ? "-" : `${active.id} (${active.title})`}`,
				`chats:\n${renderChats(store)}`
			];
			const web = await engine.listWebConversations().catch(() => []);
			if (web.length > 0) {
				const localTitles = new Set(store.list().map((chat) => chat.title));
				const missing = web.filter((item) => !localTitles.has(item.title)).map((item) => item.title);
				lines.push(`webChats:\n${web.map((item) => `  - ${item.title}`).join("\n")}`);
				if (missing.length > 0) lines.push(`webChatsNotImported (use webchat_recover):\n${missing.map((title) => `  - ${title}`).join("\n")}`);
			}
			const workspaces = listWorkspaces?.();
			if (workspaces !== void 0) {
				lines.push("workspaces:");
				if (workspaces.length === 0) lines.push("  (none)");
				else for (const ws of workspaces) lines.push(`  ${ws.id} | ${ws.title} | ${ws.path}`);
			}
			return { report: lines.join("\n") };
		}
	});
}
/** The send-via-web tool. */
function webChatSendTool(engine) {
	return defineTool({
		name: "webchat_send",
		description: "Send one message through the DeepSeek 网页端 (chat.deepseek.com) using the web model — your web session, no API billing. The assistant reply streams until complete and returns as markdown. Optionally attach local image files (absolute paths) for multimodal prompts. Requires the user to have logged into the web chat once (webchat_status → loggedIn true). Best for asking the web model to explain/design/review; do not use for file operations. Triggers: 网页端提问, deepseek web, chatgpt mode.",
		parameters: {
			text: {
				type: "string",
				required: true,
				description: "The message to send to deepseek-chat on the web."
			},
			images: {
				type: "array",
				items: { type: "string" },
				description: "Optional local absolute paths of image files to attach (multimodal prompt)."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					reply: {
						type: "string",
						required: true
					},
					error: { type: "string" },
					code: { type: "string" },
					partial: { type: "boolean" }
				}
			},
			render: (_args, value) => {
				const partial = value.partial === true;
				const hint = errorCodeHint(value.code);
				return text([
					`webchat_send: 已通过 DeepSeek 网页端发送并收到回复${partial ? "（生成可能不完整）" : ""}`,
					value.error !== void 0 ? `（注意：${value.error}）` : "",
					hint !== "" ? `（${hint}）` : "",
					"",
					"--- 网页端回复 ---",
					(value.reply ?? "").trim() === "" ? "（空回复）" : (value.reply ?? "").trim(),
					"--- 回复结束 ---",
					"",
					"会话已保存，可用 webchat_transfer 将整段对话转移到 harness 会话。"
				].join("\n"));
			}
		},
		async execute(args) {
			const textValue = typeof args?.text === "string" ? args.text.trim() : "";
			if (textValue === "") return {
				reply: "",
				error: "缺少 text 参数",
				partial: false
			};
			const images = Array.isArray(args?.images) ? args.images.filter((value) => typeof value === "string").map((value) => value) : void 0;
			const result = await engine.send(textValue, true, images);
			const sent = { reply: result.reply ?? "", partial: result.error !== void 0 };
			if (result.error !== void 0) sent.error = result.error;
			if (result.code !== void 0) sent.code = result.code;
			return sent;
		}
	});
}
/** The web-conversation recover tool (sync web sidebar → local store). */
function webChatRecoverTool(engine) {
	return defineTool({
		name: "webchat_recover",
		description: "Recover a DeepSeek 网页端 conversation into the local store so it can be imported/transferred. With no title, lists the web-side conversations. Triggers: 同步网页会话, 恢复网页对话, sync webchat.",
		parameters: { title: {
			type: "string",
			description: "Conversation title (from the web sidebar or webchat_status webChats list). Omit to list web conversations."
		} },
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: { report: {
					type: "string",
					required: true
				} }
			},
			render: (_args, value) => text(value.report ?? "")
		},
		async execute(args) {
			if (typeof args?.title === "string" && args.title.trim() !== "") {
				const result = await engine.recoverWebConversation(args.title.trim());
				if (!result.ok) return { report: `webchat_recover: 恢复失败 — ${result.error ?? ""}` };
				const dedup = result.created === false ? "（本地已存在，未重复导入）" : "";
				return { report: `webchat_recover: 已恢复「${result.title ?? ""}」为本地对话 ${result.chatId ?? ""}${dedup}。可用 webchat_transfer 转移。` };
			}
			const web = await engine.listWebConversations().catch(() => []);
			if (web.length === 0) return { report: "webchat_recover: 未在网页端读到会话（可能未登录或页面已改版）" };
			return { report: web.map((item) => `- ${item.title}`).join("\n") };
		}
	});
}
/** The transcript import tool. */
function webChatImportTool(store) {
	return defineTool({
		name: "webchat_import",
		description: "Import one stored DeepSeek 网页端 transcript as markdown so the agent can continue the discussion itself. Triggers: 读取网页对话, import webchat, 把网页聊天作为上下文. Use webchat_status to list chat ids first.",
		parameters: { chatId: {
			type: "string",
			description: "Transcript id (from webchat_status). Omit for the active chat."
		} },
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					transcript: {
						type: "string",
						required: true
					},
					error: { type: "string" }
				}
			},
			render: (_args, value) => {
				if (value.error !== void 0) return text(value.error);
				return text(value.transcript ?? "");
			}
		},
		async execute(args) {
			const chat = typeof args?.chatId === "string" ? store.getChat(args.chatId) : store.activeChat();
			if (chat === void 0) return {
				transcript: "",
				error: "webchat_import: 找不到对话记录（用 webchat_status 查看列表）"
			};
			return { transcript: renderTranscriptMarkdown(chat) };
		}
	});
}
/** The transfer tool (closes over the host context so it can create sessions). */
function webChatTransferTool(hostCtx, store, distill) {
	return defineTool({
		name: "webchat_transfer",
		description: "Transfer a stored DeepSeek 网页端 transcript into harness mode: distills the web conversation into an executable task brief (goal, established context, current state, next steps) and creates a NEW harness session whose first message is that brief (not the raw chat log), OR appends it as a fresh user message to an EXISTING session via targetSessionId (continue the same task). Optionally target a workspace (workspaceId from webchat_status workspaces list) so the new session is grouped under it. Returns the (new or target) session id. Triggers: 转移到 harness, 转成开发会话, transfer webchat.",
		parameters: {
			chatId: {
				type: "string",
				description: "Transcript id (from webchat_status). Omit for the active chat."
			},
			targetSessionId: {
				type: "string",
				description: "Optional existing harness session id to CONTINUE (append the brief as a new user message) instead of creating a new session. Omit to create a new session."
			},
			workspaceId: {
				type: "string",
				description: "Optional target workspace id (from the workspaces list in webchat_status). Omit to leave the new session ungrouped. Ignored when targetSessionId is given."
			},
			cwd: {
				type: "string",
				description: "Optional absolute working directory for the new session; ignored when workspaceId or targetSessionId is given."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					sessionId: {
						type: "string",
						required: true
					},
					distilled: { type: "boolean" },
					attached: { type: "boolean" },
					continued: { type: "boolean" },
					workspaceId: { type: "string" },
					error: { type: "string" }
				}
			},
			render: (_args, value) => {
				if (value.error !== void 0) return text(value.error);
				const note = value.distilled === true ? "（已蒸馏为任务简报）" : "（蒸馏不可用，已回退为原始对话记录）";
				if (value.continued === true) return text(`webchat_transfer: 已把网页对话作为新的用户消息延续到 harness 会话 ${value.sessionId ?? ""}${note}。请告知用户打开该会话继续开发。`);
				const where = value.workspaceId !== void 0 ? `已归入工作区 ${value.workspaceId}` : "未分组";
				return text(`webchat_transfer: 已创建新 harness 会话 ${value.sessionId ?? ""}${note}（${where}）。请告知用户从侧边栏打开该会话继续开发。`);
			}
		},
		async execute(args) {
			const chat = typeof args?.chatId === "string" ? store.getChat(args.chatId) : store.activeChat();
			if (chat === void 0) return {
				sessionId: "",
				distilled: false,
				attached: false,
				error: "webchat_transfer: 找不到对话记录（用 webchat_status 查看列表）"
			};
			const targetSessionId = typeof args?.targetSessionId === "string" && args.targetSessionId !== "" ? args.targetSessionId : void 0;
			const workspace = targetSessionId === void 0 && typeof args?.workspaceId === "string" && args.workspaceId !== "" ? { workspaceId: args.workspaceId } : void 0;
			try {
				const { sessionId, distilled, attached, workspaceId } = await transferToHarnessSession(hostCtx, {
					transcript: chat,
					cwd: args?.cwd,
					workspace,
					targetSessionId
				}, distill);
				const transferred = { sessionId, distilled, attached, continued: targetSessionId !== void 0 };
				if (workspaceId !== void 0) transferred.workspaceId = workspaceId;
				return transferred;
			} catch (error) {
				return {
					sessionId: "",
					distilled: false,
					attached: false,
					continued: targetSessionId !== void 0,
					error: `webchat_transfer: 转移失败 — ${String(error)}`
				};
			}
		}
	});
}
//#endregion
//#region src/index.ts
/** Stable cordis plugin name. */
const name = "webchat";
/** Services required before the web-chat surfaces can mount. */
const inject = [
	"webServer",
	"tools",
	"systemPrompt",
	"sessions"
];
/**
* Settings namespace of the web-chat capability — the section the web
* settings surface edits. Spelled here rather than imported: the browser half
* spells the same value and must not depend on a Host package.
*/
const WEBCHAT_SETTINGS_NAMESPACE = settingsNamespace("dsh-webchat");
const Config = import_lib.default.object({
	announceToAgent: import_lib.default.boolean().default(true),
	enabled: import_lib.default.boolean().default(true),
	browserChannel: import_lib.default.string().default("auto"),
	browserExecutablePath: import_lib.default.string().default(""),
	browserProxy: import_lib.default.string().default("direct"),
	browserHeadless: import_lib.default.boolean().default(true),
	replyTimeoutMs: import_lib.default.number().default(18e4),
	dataDir: import_lib.default.string().default(""),
	transferDistill: import_lib.default.boolean().default(true),
	transferProvider: import_lib.default.string().default(""),
	transferModel: import_lib.default.string().default(""),
	transferMaxTokens: import_lib.default.number().default(4096),
	transferChunkTokens: import_lib.default.number().default(1024)
});
/** Schema default, re-read for hand-built test contexts (the loader applies them normally). */
const DEFAULT_ANNOUNCE = true;
/** Order of the announcement section within the tool-guidance band. */
const SECTION_ORDER = 155;
/** Model-facing announcement: plugin presence, capabilities, and limits. */
const WEBCHAT_GUIDANCE = "本机已安装 dsh-webchat 插件（Codex ChatGPT 模式 · DeepSeek 网页端聊天）：侧边栏「网页聊天」入口；通过真实浏览器驱动 chat.deepseek.com（DeepSeek 网页模型，深度思考/智能搜索开关，网页登录会话，无需 API 额度）。能力：webchat_status 查看登录/会话状态、webchat_send 通过网页端发送消息并流式获取回复（可附带本地图片路径做多模态提问）、webchat_recover 把网页端已有会话同步/恢复到本地、webchat_import 把存储的网页对话导入为 markdown 上下文、webchat_transfer 把网页对话蒸馏成可执行任务简报并创建新 harness 会话（首条消息即任务简报，而非原始聊天记录），或经 targetSessionId 把简报作为新消息追加到已有会话延续同一任务；GUI 面板可将对话随时导出为工作区文件或转入 harness 会话。限制：首次使用需用户在弹出的浏览器窗口完成 DeepSeek 网页登录；网页端受 DeepSeek 官方风控，操作失败或页面改版时返回错误而非崩溃；面板提供「深度思考（R1）」与「智能搜索」开关（网页端无模型选择器）。用户提到「网页聊天 / 网页端 / ChatGPT 模式 / deepseek web / 转移到 harness」时即指本插件，请据此协作。";
/** Convert resolved config to engine config. */
function engineConfigOf(resolve) {
	const value = resolve();
	const dataDir = value.dataDir?.trim() ?? "";
	return {
		dataDir: dataDir !== "" ? dataDir : defaultDataDirOf(),
		channel: value.browserChannel === "auto" ? void 0 : value.browserChannel || void 0,
		executablePath: value.browserExecutablePath !== "" ? value.browserExecutablePath : void 0,
		proxy: value.browserProxy,
		headless: value.browserHeadless,
		replyTimeoutMs: value.replyTimeoutMs
	};
}
/** Default plugin data dir (mirrors store.defaultDataDir). */
function defaultDataDirOf() {
	return `${process.env.DSH_HOME ?? process.env.HOME ?? "."}/.dsh/dsh-webchat`;
}
/**
* Mount the engine, routes, tools, and announcement.
* @param ctx - host plugin context carrying webServer/tools/systemPrompt.
* @param config - resolved plugin config (schema defaults applied by the loader).
*/
function apply(ctx, config) {
	let current = () => config ?? {};
	const resolve = () => ({
		announceToAgent: current().announceToAgent ?? DEFAULT_ANNOUNCE,
		enabled: current().enabled ?? true,
		browserChannel: current().browserChannel ?? "auto",
		browserExecutablePath: current().browserExecutablePath ?? "",
		browserProxy: current().browserProxy ?? "direct",
		browserHeadless: current().browserHeadless ?? true,
		replyTimeoutMs: current().replyTimeoutMs ?? 18e4,
		dataDir: current().dataDir ?? "",
		transferDistill: current().transferDistill ?? true,
		transferProvider: current().transferProvider ?? "",
		transferModel: current().transferModel ?? "",
		transferMaxTokens: current().transferMaxTokens ?? 4096,
		transferChunkTokens: current().transferChunkTokens ?? 1024
	});
	const distillConfigOf = (value) => ({
		distill: value.transferDistill ?? true,
		provider: (value.transferProvider ?? "").trim(),
		model: (value.transferModel ?? "").trim(),
		maxTokens: value.transferMaxTokens ?? 4096,
		chunkTokens: value.transferChunkTokens ?? 1024
	});
	const store = new TranscriptStore({ dataDir: resolve().dataDir !== "" ? resolve().dataDir : void 0 });
	const engine = new DeepSeekWebEngine(store, engineConfigOf(resolve));
	ctx.effect(() => () => {
		engine.disposeBrowser();
	}, "dsh-webchat: engine");
	const routes = makeRoutes({
		ctx,
		engine,
		store,
		distill: distillConfigOf(resolve())
	});
	const listWorkspaces = () => {
		const registry = ctx.get("workspaceRegistry");
		if (registry === void 0) return void 0;
		return registry.list().map((ws) => ({
			id: ws.id,
			path: ws.path,
			title: ws.title
		}));
	};
	const tools = [
		webChatStatusTool(engine, store, listWorkspaces),
		webChatSendTool(engine),
		webChatRecoverTool(engine),
		webChatImportTool(store),
		webChatTransferTool(ctx, store, distillConfigOf(resolve()))
	];
	let disposeSection;
	let disposeRoutes;
	let disposeTools;
	const sync = () => {
		if (disposeSection !== void 0) {
			disposeSection();
			disposeSection = void 0;
		}
		if (disposeRoutes !== void 0) {
			disposeRoutes();
			disposeRoutes = void 0;
		}
		if (disposeTools !== void 0) {
			disposeTools();
			disposeTools = void 0;
		}
		const value = resolve();
		if (!value.enabled) return;
		if (value.announceToAgent) disposeSection = ctx.systemPrompt.section({
			name: "plugin:dsh-webchat",
			order: SECTION_ORDER,
			text: WEBCHAT_GUIDANCE
		});
		disposeRoutes = ctx.effect(() => {
			const disposers = routes.map((route) => ctx.webServer.register(route));
			return () => {
				for (const dispose of disposers) dispose();
			};
		}, "dsh-webchat: routes");
		disposeTools = ctx.effect(() => {
			const disposers = tools.map((tool) => ctx.tools.register(tool));
			return () => {
				for (const dispose of disposers) dispose();
			};
		}, "dsh-webchat: tools");
	};
	installSettingsSection(ctx, WEBCHAT_SETTINGS_NAMESPACE, Config, config ?? {}, {
		setSource: (source) => {
			current = source;
			sync();
		},
		onChange: sync
	});
	sync();
}
//#endregion
export { Config, WEBCHAT_GUIDANCE, WEBCHAT_SETTINGS_NAMESPACE, apply, inject, name };
