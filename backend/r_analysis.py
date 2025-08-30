# r_analysis.py
"""
Funções utilitárias para análises estatísticas e linguísticas via R, integráveis ao FastAPI.
Inclui: estatísticas descritivas, histogramas, legibilidade, coocorrência, testes estatísticos básicos.
"""

import logging
try:
    import rpy2.robjects as robjects
    from rpy2.robjects.packages import importr
    from rpy2.robjects import StrVector
    R_AVAILABLE = True
except ImportError:
    R_AVAILABLE = False
    robjects = None
    importr = None
    StrVector = None

logger = logging.getLogger(__name__)

def r_stats(words, sentences):
    """Estatísticas descritivas em R (mean, median, var)"""
    if not R_AVAILABLE or not words:
        return {}
    try:
        r_words = StrVector(words)
        robjects.globalenv['words'] = r_words
        robjects.r('words <- as.character(words)')
        mean_len = robjects.r('mean(nchar(words))')[0]
        median_len = robjects.r('median(nchar(words))')[0]
        var_len = robjects.r('var(nchar(words))')[0]
        return {
            'mean_word_length_r': float(mean_len),
            'median_word_length_r': float(median_len),
            'word_length_variance_r': float(var_len)
        }
    except Exception as e:
        logger.error(f"Erro em r_stats: {e}")
        return {'error': str(e)}

def r_histogram(sentence_lengths):
    """Histograma de comprimento de frases em R (retorna lista de bins)"""
    if not R_AVAILABLE or not sentence_lengths:
        return {}
    try:
        r_sentlens = robjects.FloatVector(sentence_lengths)
        robjects.globalenv['sentlens'] = r_sentlens
        hist = robjects.r('hist(sentlens, plot=FALSE)')
        return {
            'breaks': list(hist.rx2('breaks')),
            'counts': list(hist.rx2('counts'))
        }
    except Exception as e:
        logger.error(f"Erro em r_histogram: {e}")
        return {'error': str(e)}

def r_readability(text):
    """Índices de legibilidade via quanteda (Flesch)"""
    if not R_AVAILABLE or not text:
        return {}
    try:
        robjects.globalenv['text'] = text
        robjects.r('suppressMessages(library(quanteda.textstats))')
        flesch = robjects.r('textstat_readability(text, measure="Flesch")$Flesch')
        return {'flesch_readability_r': float(flesch[0])}
    except Exception as e:
        logger.error(f"Erro em r_readability: {e}")
        return {'error': str(e)}

def r_cooccurrence(words):
    """Coocorrência simples via R (quanteda)"""
    if not R_AVAILABLE or not words:
        return {}
    try:
        robjects.globalenv['words'] = StrVector(words)
        robjects.r('library(quanteda)')
        robjects.r('toks <- tokens(words)')
        fcm = robjects.r('fcm(toks)')
        # Retorna matriz de coocorrência como dict
        return {'cooccurrence_matrix': str(fcm)}
    except Exception as e:
        logger.error(f"Erro em r_cooccurrence: {e}")
        return {'error': str(e)}

def r_ttest(x, y):
    """Teste t de comparação entre dois vetores (ex: comprimento de palavras)"""
    if not R_AVAILABLE or not x or not y:
        return {}
    try:
        robjects.globalenv['x'] = robjects.FloatVector(x)
        robjects.globalenv['y'] = robjects.FloatVector(y)
        ttest = robjects.r('t.test(x, y)')
        pval = ttest.rx2('p.value')[0]
        return {'ttest_pvalue': float(pval)}
    except Exception as e:
        logger.error(f"Erro em r_ttest: {e}")
        return {'error': str(e)}
