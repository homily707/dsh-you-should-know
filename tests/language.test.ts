import { describe, expect, it } from 'vitest'
import { defaults, languageOf } from '../src/core/config.js'
import { explanationPrompt, observerPrompt } from '../src/core/prompts.js'
import { Config } from '../src/host/config.js'

describe('语言设置与旁路协议', () => {
  it('旧配置补全无限检查上限，步长与上限拒绝非法数字', async () => {
    const result = await Config['~standard'].validate({})
    expect('value' in result && result.value.get().maxChecksPerTurn).toBe(0)
    for (const patch of [{ checkEvery: 0 }, { checkEvery: 1.5 }, { maxChecksPerTurn: -1 }, { maxChecksPerTurn: 1.5 }, { maxChecksPerTurn: Infinity }]) {
      expect(await Config['~standard'].validate(patch)).toHaveProperty('issues')
    }
  })
  it('默认跟随系统，旧配置无需迁移，拒绝非法语言', async () => {
    const result = await Config['~standard'].validate({})
    expect('value' in result && result.value.get().language).toBe('auto')
    expect(defaults.language).toBe('auto')
    expect(await Config['~standard'].validate({ language: 'fr' })).toHaveProperty('issues')
  })
  it.each([
    ['auto', 'zh-CN', 'zh-CN'], ['auto', 'zh-TW', 'zh-CN'], ['auto', 'en-US', 'en-US'],
    ['zh-CN', 'en-US', 'zh-CN'], ['en-US', 'zh-CN', 'en-US'],
  ] as const)('%s 与系统 %s 解析为 %s', (setting, locale, language) => {
    expect(languageOf(setting, locale)).toBe(language)
  })
  it.each(['zh-CN', 'en-US'] as const)('%s 保留完整协议、历史主题及敏感内容限制', language => {
    const prompt = observerPrompt(['seen topic'], ['known topic'], language)
    expect(prompt).toContain('learn: none')
    expect(prompt).toContain('tag:')
    expect(prompt).toContain('explain:')
    expect(prompt).toContain('["seen topic"]')
    expect(prompt).toContain('["known topic"]')
    expect(prompt).toContain(language === 'zh-CN' ? '不要复述密钥' : 'Do not repeat secrets')
    // 默认观察同时关注目标、执行、停止时机和认知盲区。
    for (const topic of language === 'zh-CN'
      ? ['用户目标', '实现一致性', '执行质量与收敛', '重要认知', '必要验证']
      : ['User goals', 'Implementation alignment', 'Execution quality and stopping', 'Critical understanding', 'essential validation']) {
      expect(prompt).toContain(topic)
    }
    expect(explanationPrompt('A selected note.', language)).toContain(language === 'zh-CN' ? '使用简体中文' : 'Write in English')
  })
})
